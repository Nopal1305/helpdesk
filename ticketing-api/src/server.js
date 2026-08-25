import server from './server/server.js';

const host = process.env.DB_HOST;
const port = process.env.PORT;

server.listen(port, () => {
    console.log(`server running at http://${host}:${port}`);
})