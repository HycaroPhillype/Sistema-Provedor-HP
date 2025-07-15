import { execSync } from 'child_process';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';


module.exports =  async () => {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    globalThis.__APP__ = app;

    
};
