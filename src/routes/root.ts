import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return { root: true }
  })
  fastify.get('/ping2', async function (request, reply) {
    return 'pong2\n'
  })
}

export default root
