// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: true,
  remoteApiUrl: 'https://vdc-repo.vmware.com/apix',
  remoteSampleExchangeUrl: 'https://apigw.vmware.com/sampleExchange/v1',
  localApiUrl: 'local.json',
  enableLocal: true,
  enableRemote: true,
  ssoId: 'none',
  authApiUrl: '',
  defaultKeywordsFilter: '',
  defaultProductsFilter: [],
  defaultLanguagesFilter: [],
  defaultTypesFilter: [],
  defaultSourcesFilter: [],
  hideFilters: false,
  hideProductFilter: false,
  hideLanguageFilter: false,
  hideSourceFilter: false
};
