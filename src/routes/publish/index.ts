import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { create, CID } from 'kubo-rpc-client'
import { simpleGit, SimpleGit } from 'simple-git';
import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

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
    const links = dag.value.Links;
    const hexMap = new Map();
    for (const link of links) {
      const hash = link.Hash;
      const name = link.Name;
      const hex = name.replace(/-.*$/, '')
      hexMap.set(hex, `${hash}`);
      request.log.info(`Dag link: ${hex}: ${name} -> ${hash}`);
    }

    const remoteUrl = "https://github.com/hexcamp/hexcamp-coredns-sites.git";
    const git: SimpleGit = simpleGit().clone(remoteUrl);
    request.log.info(`Git: ${git}`);

    const data = readFileSync('hexcamp-coredns-sites/jim.csv', 'utf-8');

    const records = parse(data, {
      columns: true,
      skip_empty_lines: true
    });
    for (const record of records) {
      if (hexMap.has(record.hex_id)) {
        request.log.info(`Before: ${JSON.stringify(record)}`);
        record.dnslink_cid = hexMap.get(record.hex_id)
        request.log.info(`After: ${JSON.stringify(record)}`);
      }
    }
    const output = stringify(records, { header: true });
    writeFileSync('hexcamp-coredns-sites/jim2.csv', output);

    return `publish: ${cid}\n`
  })
}

export default publish
