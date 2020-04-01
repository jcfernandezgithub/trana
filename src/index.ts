import App from './app';
import dotenv from 'dotenv';

dotenv.config();
const server = new App();

server.init();
server.initSocket();