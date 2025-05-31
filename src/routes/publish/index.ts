import { FastifyPluginAsync, FastifyRequest } from 'fastify'
import { create, CID } from 'kubo-rpc-client'
import { simpleGit, SimpleGit } from 'simple-git';
import { readFileSync, writeFileSync, rmSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import 'dotenv/config';

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

    const ipfs = create({ url: process.env.IPFS_API });
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

    const repoOrg = process.env.REPO_ORG || '';
    const repoName = process.env.REPO_NAME || '';
    const remoteUrl = `https://${process.env.GITHUB_PAT}@github.com/${repoOrg}/${repoName}.git`;
    try {
      rmSync(repoName, { recursive: true });
    } catch (e) {}
    const git: SimpleGit = simpleGit();
    await git.clone(remoteUrl);
    git.cwd(repoName);

    const data = readFileSync(`${repoName}/jim.csv`, 'utf-8');

    const records = parse(data, {
      columns: true,
      skip_empty_lines: true
    });
    for (const record of records) {
      if (hexMap.has(record.hex_id)) {
        request.log.info(`Before: ${JSON.stringify(record)}`);
        record.dnslink_cid = hexMap.get(record.hex_id);
        request.log.info(`After: ${JSON.stringify(record)}`);
      }
    }
    const output = stringify(records, { header: true });
    writeFileSync(`${repoName}/jim.csv`, output);

    await git.add('jim.csv');
    await git.commit('Updated from hackmd-updater');
    const hash = await git.revparse(['HEAD']);
    await git.push('origin', 'main');
    return `Published CID: ${cid} to Git Hash: ${hash}\n`
  })
}

export default publish
