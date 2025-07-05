declare module 'radius' {
  export class Client {
    constructor(config: {
      host: string;
      secret: string;
      port?: number;
      timeout?: number;
    });
    // Adicione outros métodos que você usa
  }
}