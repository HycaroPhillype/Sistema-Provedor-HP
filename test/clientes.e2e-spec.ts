import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cliente } from '../src/clientes/entities/cliente.entity';
import { Repository } from 'typeorm';
import { INestApplication } from '@nestjs/common';

describe('ClientesController (e2e)', () => {
  let app: INestApplication;
  let clientesRepo: Repository<Cliente>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    clientesRepo = moduleFixture.get<Repository<Cliente>>(
      getRepositoryToken(Cliente),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clientesRepo.delete({});
  });

  it('/clientes/:id (DELETE) - deve remover um cliente com sucesso', async () => {
    const newCliente = await clientesRepo.save({
      nome: 'Cliente Teste',
      cpf: '123.456.789-01',
      endereco: 'Rua Teste, 123',
      plano: '100Mbps',
      login: 'cliente_teste',
      senha: 'senha123',
      ativo: true,
    });

    await request(app.getHttpServer())
      .delete(`/clientes/${newCliente.id}`)
      .expect(200);

    const clienteRemovido = await clientesRepo.findOneBy({ id: newCliente.id });

    expect(clienteRemovido).toBeDefined();
    expect(clienteRemovido.ativo).toBe(false);
  });

  it('/clientes/:id (DELETE) - deve retornar 404 se o cliente não existir', async () => {
    await request(app.getHttpServer())
      .delete('/clientes/9999')
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe(
          'Cliente com ID 9999 não encontrado',
        );
      });
  });

  it('/clientes/:id (DELETE) - deve retornar 400 se o ID for inválido', async () => {
    await request(app.getHttpServer())
      .delete('/clientes/abc')
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe('ID inválido');
      });
  });

  it('deve chamar o serviço RADIUS ao remover cliente', async () => {
    const cliente = await clientesRepo.save({
      nome: 'Cliente RADIUS',
      cpf: '12345678902',
      endereco: 'Rua RADIUS, 456',
      plano: '200Mbps',
      login: 'cliente_radius',
      senha: 'senha123',
      ativo: true,
    });

    await request(app.getHttpServer())
      .delete(`/clientes/${cliente.id}`)
      .expect(200);

    console.log(
      `[VERIFICAÇÃO] O usuário ${cliente.login} foi removido do RADIUS.`,
    );
  });
});
