import Cookies from 'universal-cookie';

export class Backend {
  isActiveSession() {
    return fetch('/api/v2/internal/sessionactive')
      .then(response => {
        let active = response.ok ? true : false
        return active 
      })
      .catch(() => false);
  };

  isTenantSchema() {
    return fetch('/api/v2/internal/istenantschema')
      .then(response => response.ok ? response.json() : null)
      .then(json => json['isTenantSchema'])
      .catch(err => alert(`Something went wrong: ${err}`))
  };

  fetchData(url) {
    return fetch(url)
      .then(response => response.json())
      .catch(err => alert(`Something went wrong: ${err}`));
  };

  fetchListOfNames(url) {
    return fetch(url)
      .then(response => response.json())
      .then(json => {
        let list = [];
        json.forEach((e) => list.push(e.name));
        return list;
      })
      .catch(err => alert(`Something went wrong: ${err}`));
  };

  fetchResult(url) {
    return fetch(url)
      .then(response => response.json())
      .then(json => json['result'])
      .catch(err => alert(`Something went wrong: ${err}`));
  };

  changeMetricProfile(profile) {
    return this.send(
      '/api/v2/internal/metricprofiles/',
      'PUT',
      profile
    );
  }

  changeAggregation(profile) {
    return this.send(
      '/api/v2/internal/aggregations/',
      'PUT',
      profile
    );
  }

  changeUser(user) {
    return this.send(
      '/api/v2/internal/users/',
      'PUT',
      user
    );
  }

  changeUserProfile(user) {
    return this.send(
      '/api/v2/internal/userprofile/',
      'PUT',
      user
    );
  }

  changeGroup(group, data) {
    return this.send(
      '/api/v2/internal/' + group + 'group/',
      'PUT',
      data
    );
  }

  changeMetric(metric) {
    return this.send(
      '/api/v2/internal/metric/',
      'PUT',
      metric
    )
  }

  changeToken(token) {
    return this.send(
      '/api/v2/internal/apikeys/',
      'PUT',
      token
    )
  }

  changeProbe(probe) {
    return this.send(
      '/api/v2/internal/probes/',
      'PUT',
      probe
    )
  }

  changeMetricTemplate(metric) {
    return this.send(
      '/api/v2/internal/metrictemplates/',
      'PUT',
      metric
    )
  }

  changeYumRepo(repo) {
    return this.send(
      '/api/v2/internal/yumrepos/',
      'PUT',
      repo
    );
  }

  changeThresholdsProfile(profile) {
    return this.send(
      '/api/v2/internal/thresholdsprofiles/',
      'PUT',
      profile
    );
  }

  changePackage(pkg) {
    return this.send(
      '/api/v2/internal/packages/',
      'PUT',
      pkg
    );
  }

  addAggregation(profile) {
    return this.send(
      '/api/v2/internal/aggregations/',
      'POST',
      profile
    );
  }

  addMetricProfile(profile) {
    return this.send(
      '/api/v2/internal/metricprofiles/',
      'POST',
      profile
    );
  }

  addUser(user) {
    return this.send(
      '/api/v2/internal/users/',
      'POST',
      user
    );
  }

  addUserProfile(user) {
    return this.send(
      '/api/v2/internal/userprofile/',
      'POST',
      user
    );
  }

  addGroup(group, name) {
    return this.send(
      '/api/v2/internal/' + group + 'group/',
      'POST',
      name
    );
  }

  addToken(token) {
    return this.send(
      '/api/v2/internal/apikeys/',
      'POST',
      token
    );
  }

  addProbe(probe) {
    return this.send(
      '/api/v2/internal/probes/',
      'POST',
      probe
    );
  }

  addMetricTemplate(metric) {
    return this.send(
      '/api/v2/internal/metrictemplates/',
      'POST',
      metric
    );
  }

  addYumRepo(repo) {
    return this.send(
      '/api/v2/internal/yumrepos/',
      'POST',
      repo
    );
  }

  addThresholdsProfile(profile) {
    return this.send(
      '/api/v2/internal/thresholdsprofiles/',
      'POST',
      profile
    )
  }

  addPackage(pkg) {
    return this.send(
      '/api/v2/internal/packages/',
      'POST',
      pkg
    );
  }

  deleteMetricProfile(id) {
    return this.send(
      '/api/v2/internal/metricprofiles/' + id,
      'DELETE',
    );
  }

  deleteAggregation(id) {
    return this.send(
      '/api/v2/internal/aggregations/' + id,
      'DELETE'
    );
  }

  deleteUser(id) {
    return this.send(
      '/api/v2/internal/users/' + id,
      'DELETE'
    );
  }

  deleteGroup(group, name) {
    return this.send(
      '/api/v2/internal/' + group + 'group/' + name,
      'DELETE'
    );
  }

  deleteMetric(name) {
    return this.send(
      '/api/v2/internal/metric/' + name,
      'DELETE'
    );
  }

  deleteToken(name) {
    return this.send(
      '/api/v2/internal/apikeys/' + name,
      'DELETE'
    );
  }

  deleteProbe(name) {
    return this.send(
      '/api/v2/internal/probes/' + name,
      'DELETE'
    );
  }

  deleteMetricTemplate(name) {
    return this.send(
      '/api/v2/internal/metrictemplates/' + name,
      'DELETE'
    );
  }

  deleteYumRepo(name, tag) {
    return this.send(
      '/api/v2/internal/yumrepos/' + name + '/' + tag,
      'DELETE'
    );
  }

  deleteThresholdsProfile(id) {
    return this.send(
      '/api/v2/internal/thresholdsprofiles/' + id,
      'DELETE'
    );
  }

  deletePackage(nameversion) {
    return this.send(
      '/api/v2/internal/packages/' + nameversion,
      'DELETE'
    );
  }

  importMetrics(data) {
    return this.send(
      '/api/v2/internal/importmetrics/',
      'POST',
      data
    )
  }

  send(url, method, values=undefined) {
    const cookies = new Cookies();

    return fetch(url, {
      method: method,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': cookies.get('csrftoken'),
        'Referer': 'same-origin'
      },
      body: values && JSON.stringify(values)
    });
  }

}

export class WebApi {
  constructor(
    {
      token=undefined, 
      metricProfiles=undefined,
      aggregationProfiles=undefined,
      thresholdsProfiles=undefined,
      reportsConfigurations=undefined
    }) {
    this.token = token;
    this.metricprofiles = metricProfiles;
    this.aggregationprofiles = aggregationProfiles; 
    this.thresholdsprofiles = thresholdsProfiles;
  }

  fetchMetricProfiles() {
    return fetch(this.metricprofiles,
      {headers: 
        {
          "Accept": "application/json",
          "x-api-key": this.token
        }
      })
      .then(response => response.json())
      .then(json => json['data']) 
      .catch(err => alert('Something went wrong: ' + err));
  }

  fetchMetricProfile(id) {
    return fetch(this.metricprofiles + '/' + id, 
      {headers: 
        {
          "Accept": "application/json",
          "x-api-key": this.token
        }
      })
      .then(response => response.json())
      .then(json => json['data'])
      .then(array => array[0])
      .catch(err => alert('Something went wrong: ' + err));
  }

  fetchAggregationProfile(id) {
    return fetch(this.aggregationprofiles + '/' + id, 
      {headers: 
        {
          "Accept": "application/json",
          "x-api-key": this.token
        }
      })
      .then(response => response.json())
      .then(json => json['data'])
      .then(array => array[0])
      .catch(err => alert('Something went wrong: ' + err));
  }

  fetchThresholdsProfile(id) {
    return fetch(this.thresholdsprofiles + '/' + id,
    {
      headers:
        {
          "Accept": "application/json",
          "x-api-key": this.token
        }
    })
      .then(response => response.json())
      .then(json => json['data'])
      .then(array => array[0])
      .catch(err => alert('Something went wrong: ' + err))
  }

  changeAggregation(profile) {
    return this.send(
      this.aggregationprofiles + '/' + profile.id,
      'PUT',
      profile
    );
  }

  changeMetricProfile(profile) {
    return this.send(
      this.metricprofiles + '/' + profile.id,
      'PUT',
      profile
    );
  }

  changeThresholdsProfile(profile) {
    return this.send(
      this.thresholdsprofiles + '/' + profile.id,
      'PUT',
      profile
    );
  }

  addMetricProfile(profile) {
    return this.send(
      this.metricprofiles,
      'POST',
      profile
    );
  }

  addAggregation(profile) {
    return this.send(
      this.aggregationprofiles,
      'POST',
      profile
    );
  }

  addThresholdsProfile(profile) {
    return this.send(
      this.thresholdsprofiles,
      'POST',
      profile
    );
  }

  deleteMetricProfile(id) {
    return this.send(
      this.metricprofiles + '/' + id,
      'DELETE'
    );
  }

  deleteAggregation(id) {
    return this.send(
      this.aggregationprofiles + '/' + id,
      'DELETE'
    );
  }

  deleteThresholdsProfile(id) {
    return this.send(
      this.thresholdsprofiles + '/' + id,
      'DELETE'
    );
  }

  send(url, method, values=null) {
    return fetch(url, {
      method: method,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': this.token
      },
      body: values && JSON.stringify(values) 
    });
  }

}
