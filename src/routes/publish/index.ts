import { FastifyPluginAsync, FastifyRequest } from 'fastify'

interface IParams {
  cid: string
}

const publish: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post<{ Params: IParams }>('/:cid', async function (
    request: FastifyRequest<{ Params: IParams }>,
    reply
  ) {
    const { cid } = request.params;
    return `publish: ${cid}\n`
  })
}

export default publish
