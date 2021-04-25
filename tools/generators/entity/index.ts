import { Tree, formatFiles, readWorkspaceConfiguration, readProjectConfiguration, generateFiles, ProjectConfiguration } from '@nrwl/devkit';
import path from 'path';
import { EntitySchema } from './schema';
import { strings } from '@angular-devkit/core';

function addLibExport(host: Tree, projConfig: ProjectConfiguration, schema: EntitySchema): void {
  const indexTsPath = path.join(projConfig.sourceRoot, 'index.ts');
  const indexTs = host.read(indexTsPath).toString();

  const entityFileName = `./${strings.dasherize(schema.entity)}.ts`;
  const entityName = strings.capitalize(schema.entity);
  const dataServiceFileName = `./${strings.dasherize(schema.entity)}.data-service.ts`;
  const dataServiceName = strings.capitalize(schema.entity) + 'DataService';

  const updatedIndexTs = indexTs + `
export { ${entityName} } from ${entityFileName};
export { ${dataServiceName} } from ${dataServiceFileName};
`;

  host.write(indexTsPath, updatedIndexTs);
}

export default async function (host: Tree, schema: EntitySchema) {
  const workspaceConf = readWorkspaceConfiguration(host);

  if (!schema.project) {
    schema.project = workspaceConf.defaultProject;
  }

  if (!schema.project) {
    throw new Error('No project specified!');
  }

  const projConf = readProjectConfiguration(host, schema.project);

  generateFiles(
    host,
    path.join(__dirname, 'files'),
    projConf.sourceRoot,
    {
      entity: strings.dasherize(schema.entity),
      strings
    }
  );

  addLibExport(host, projConf, schema);

  await formatFiles(host);
}
