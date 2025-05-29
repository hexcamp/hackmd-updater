import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { create, CID } from 'kubo-rpc-client'

interface IParams {
  cid: string
}

const publish: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post<{ Params: IParams }>('/:cid', async function (
    request: FastifyRequest<{ Params: IParams }>,
    reply
  ) {
    const { cid } = request.params;
    const parsedCid = CID.parse(cid);

    const ipfs = create({ url: 'http://localhost:5001/api/v0' });
    const dag = await ipfs.dag.get(parsedCid);
    request.log.info("Dag:", dag);

    return `publish: ${cid}\n`
  })
}

export default publish
