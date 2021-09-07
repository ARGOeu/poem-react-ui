import { Backend } from "./DataManager";

export const fetchUserGroups = async (isTenantSchema) => {
  const backend = new Backend();
  if (isTenantSchema) {
    let allgroups = await backend.fetchResult('/api/v2/internal/usergroups');

    return allgroups;
  }
}


export const fetchYumRepos = async () => {
  const backend = new Backend()
  return await backend.fetchData('/api/v2/internal/yumrepos')
}


export const fetchOStags = async () => {
  const backend = new Backend();
  return await backend.fetchData('/api/v2/internal/ostags');
}


export const fetchUserDetails = async (isTenantSchema) => {
  const backend = new Backend();

  let arg = isTenantSchema ? true : false;
  let session = await backend.isActiveSession(arg);

  if (session.active)
    return session.userdetails;
}


export const fetchAllMetrics = async (publicView) => {
  const backend = new Backend();
  return await backend.fetchListOfNames(`/api/v2/internal/${publicView ? 'public_' : ''}metricsall`);
};


export const fetchPackages = async (publicView=false) => {
  const backend = new Backend();
  return await backend.fetchData(`/api/v2/internal/${publicView ? 'public_' : ''}packages`)
}


export const fetchProbeVersions = async () => {
  const backend = new Backend();
  return await backend.fetchData('/api/v2/internal/version/probe');
}


export const fetchOperationsProfiles = async (webapi) => {
  return await webapi.fetchOperationsProfiles();
}


export const fetchProbeVersion = async (publicView, name) => {
  const backend = new Backend();
  return await backend.fetchData(`/api/v2/internal/${publicView ? 'public_' : ''}version/probe/${name}`);
}