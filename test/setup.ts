import { execSync } from 'child_process';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';


module.exports =  async () => {
    execSync(`npm run typeorm migration:run`, { stdio: 'inherit'});

    const module = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    globalThis.app = module.createNestApplication();
    await globalThis.PageSwapEvent.init();

};
