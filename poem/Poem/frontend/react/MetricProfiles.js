import React, { useState, useMemo, useContext, useEffect } from 'react';
import {Link} from 'react-router-dom';
import {Backend, WebApi} from './DataManager';
import {
  LoadingAnim,
  BaseArgoView,
  SearchField,
  NotifyOk,
  Icon,
  DiffElement,
  NotifyError,
  ErrorComponent,
  ParagraphTitle,
  ProfilesListTable,
  CustomError,
  ProfileMain,
  CustomReactSelect
} from './UIElements';
import {
  Button,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faSearch } from '@fortawesome/free-solid-svg-icons';
import ReactDiffViewer from 'react-diff-viewer';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import PapaParse from 'papaparse';
import { downloadCSV } from './FileDownload';
import {
  fetchAllMetrics,
  fetchUserDetails,
  fetchBackendMetricProfiles
} from './QueryFunctions';

import './MetricProfiles.css';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';
import * as yup from "yup"
import { yupResolver } from '@hookform/resolvers/yup';


export const MetricProfilesClone = (props) => <MetricProfilesComponent cloneview={true} {...props}/>;
export const MetricProfilesChange = (props) => <MetricProfilesComponent {...props}/>;


function matchItem(item, value) {
  return item.toLowerCase().indexOf(value.toLowerCase()) !== -1;
}


const MetricProfilesComponentContext = React.createContext();


const MetricProfilesSchema = yup.object().shape({
  name: yup.string().required("Required"),
  groupname: yup.string().required("Required"),
  view_services: yup.array()
  .of(yup.object().shape({
    service: yup.string()
      .required("Required")
      .test("predefined_services", "Must be one of predefined service types", function (value) {
        let arr = this.options.context.allServices.map(service => service.name)
        if (arr.indexOf(value) === -1)
          return false

        else
          return true
      }),
    metric: yup.string()
      .required("Required")
      .test("predefined_metrics", "Must be one of predefined metrics", function (value) {
        if (this.options.context.allMetrics.indexOf(value) == -1)
          return false

        else
          return true
      })
  }))
})


const MetricProfileAutocompleteField = ({
  tupleType,
  index,
  error,
  isNew
}) => {
  const context = useContext(MetricProfilesComponentContext)

  const { control, getValues, setValue, clearErrors } = useFormContext()

  const name = `view_services.${index}.${tupleType}`

  const options = tupleType === "service" ?
    context.serviceflavours_all.map(service => service.name)
  :
    tupleType === "metric" ?
      context.metrics_all
    :
      undefined

  const changeFieldValue = (newValue) => {
    if (getValues("view_services").length === 1 && getValues(name) == "")
      setValue(`view_services.${index}.isNew`, true)

    else
      setValue(`${name}Changed`, true)

    setValue(name, newValue)
    clearErrors(name)
  }

  return (
    <Controller
      name={ name }
      control={ control }
      render={ ({ field }) =>
        <CustomReactSelect
          forwardedRef={ field.ref }
          onChange={ e => changeFieldValue(e.value) }
          options={ options.map(option => new Object({ label: option, value: option })) }
          value={ field.value ? { label: field.value, value: field.value } : undefined }
          error={ error || (!isNew && getValues("view_services")?.[index]?.[`${tupleType}Changed`]) }
          isnew={ isNew }
        />
      }
    />
  )
}


const sortServices = (a, b) => {
  if (a.service.toLowerCase() < b.service.toLowerCase()) return -1;
  if (a.service.toLowerCase() > b.service.toLowerCase()) return 1;
  if (a.service.toLowerCase() === b.service.toLowerCase()) {
    if (a.metric.toLowerCase() < b.metric.toLowerCase()) return -1;
    if (a.metric.toLowerCase() > b.metric.toLowerCase()) return 1;
    if (a.metric.toLowerCase() === b.metric.toLowerCase()) return 0;
  }
}


const ServicesList = () => {
  const context = useContext(MetricProfilesComponentContext);

  const { control, setValue, getValues, clearErrors, trigger, formState: { errors } } = useFormContext()

  const { fields, insert, remove } = useFieldArray({ control, name: "view_services" })

  const handleSearch = (field, value) => {
    let filtered = context.listServices
    let tmp_list_services = [...context.listServices];

    let statefieldsearch = undefined
    let alternatestatefield = undefined
    let alternatefield = ""

    if (field === "service") {
      statefieldsearch = context.searchServiceFlavour
      alternatestatefield = context.searchMetric
      alternatefield = "metric"
    }

    else if (field === "metric") {
      statefieldsearch = context.searchMetric
      alternatestatefield = context.searchServiceFlavour
      alternatefield = "service"
    }

    if (statefieldsearch.length > value.length) {
      // handle remove of characters of search term
      filtered = context.listServices.filter((elem) => matchItem(elem[field], value))

      tmp_list_services.sort(sortServices);
    }
    else if (value !== '') {
      filtered = context.listServices.filter((elem) =>
        matchItem(elem[field], value))
    }

    // handle multi search
    if (alternatestatefield.length) {
      filtered = filtered.filter((elem) =>
        matchItem(elem[alternatefield], alternatestatefield))
    }

    filtered.sort(sortServices);

    setValue("view_services", filtered)
  }

  return (
    <table className="table table-bordered table-sm table-hover">
      <thead className="table-active">
        <tr>
          <th className="align-middle text-center" style={{width: "5%"}}>#</th>
          <th style={{width: !context.publicView ? "42.5%" : "47.5%"}}><Icon i="serviceflavour"/> Service flavour</th>
          <th style={{width: !context.publicView ? "42.5%" : "47.5%"}}><Icon i='metrics'/> Metric</th>
          {
            !(context.publicView || context.historyview) &&
              <th style={{width: "10%"}}>Actions</th>
          }
        </tr>
      </thead>
      <tbody>
        <tr style={{background: "#ECECEC"}}>
          <td className="align-middle text-center">
            <FontAwesomeIcon icon={faSearch}/>
          </td>
          <td>
            <Controller
              name="search_serviceflavour"
              control={ control }
              render={ ({ field }) =>
                <SearchField
                  field={ field }
                  forwardedRef={ field.ref }
                  className="form-control"
                  onChange={ e => handleSearch("service", e.target.value) }
                />
              }
            />
          </td>
          <td>
            <Controller
              name="search_metric"
              control={ control }
              render={ ({ field }) =>
                <SearchField
                  field={ field }
                  forwardedRef={ field.ref }
                  className="form-control"
                  onChange={ e => handleSearch("metric", e.target.value) }
              />
              }
            />
          </td>
          {
            !(context.publicView || context.historyview) &&
              <td>
                {''}
              </td>
          }
        </tr>
        {
          fields.map((service, index) =>
            !(context.publicView || context.historyview) ?
              <React.Fragment key={ service.id }>
                <tr key={index}>
                  <td className={service.isNew ? "bg-light align-middle text-center" : "align-middle text-center"}>
                    {index + 1}
                  </td>
                  <td className={service.isNew ? "bg-light" : ""}>
                    <Controller
                      name={ `view_services.${index}.service` }
                      control={ control }
                      render={ ({ field }) =>
                        <MetricProfileAutocompleteField
                          forwardedRef={ field.id }
                          tupleType='service'
                          index={ index }
                          isNew={ service.isNew }
                          error={ errors?.view_services?.[index]?.service || errors?.view_services?.[index]?.dup }
                        />
                      }
                    />
                    {
                      errors?.view_services?.[index]?.service &&
                        <CustomError error={ errors?.view_services?.[index]?.service?.message } />
                    }
                  </td>
                  <td className={service.isNew ? "bg-light" : ""}>
                    <Controller
                      name={ `view_services.${index}.metric` }
                      control={ control }
                      render={ ({ field }) =>
                        <MetricProfileAutocompleteField
                          forwardedRef={ field.id }
                          tupleType='metric'
                          index={ index }
                          isNew={ service.isNew }
                          error={ errors?.view_services?.[index]?.metric || errors?.view_services?.[index]?.dup }
                        />
                      }
                    />
                    {
                      errors?.view_services?.[index]?.metric &&
                        <CustomError error={ errors?.view_services?.[index]?.metric?.message } />
                    }
                  </td>
                  <td className={service.isNew ? "bg-light align-middle ps-3" : "align-middle ps-3"}>
                    <Button
                      size="sm"
                      color="light"
                      data-testid={`remove-${index}`}
                      onClick={() => {
                        remove(index)
                        clearErrors("view_services")
                        trigger("view_services")
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes}/>
                    </Button>
                    <Button
                      size="sm"
                      color="light"
                      data-testid={`insert-${index}`}
                      onClick={() => {
                        let new_element = { index: index + 1, service: '', metric: '', isNew: true }
                        insert(index + 1, new_element)
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus}/>
                    </Button>
                  </td>
                </tr>
                {
                  errors?.view_services?.[index]?.dup &&
                    <tr key={index + getValues("view_services").length}>
                      <td className="bg-light"></td>
                      <td colSpan="2" className="bg-light text-center">
                        <CustomError error={ errors?.view_services?.[index]?.dup?.message } />
                      </td>
                      <td className="bg-light"></td>
                    </tr>
                }
              </React.Fragment>
            :
              <tr key={ service.id }>
                <td className="align-middle text-center">{ index + 1 }</td>
                <td>{ service.service }</td>
                <td>{ service.metric }</td>
              </tr>
          )
        }
      </tbody>
    </table>
  )
}


const fetchMetricProfile = async (webapi, apiid) => {
  return await webapi.fetchMetricProfile(apiid);
}


const MetricProfilesForm = ({
  metricProfile,
  userDetails,
  metricsAll=undefined,
  servicesAll=undefined,
  doChange=undefined,
  doDelete=undefined,
  historyview=false,
  ...props
}) => {
  const profile_name = props.match.params.name;
  const addview = props.addview
  const location = props.location;
  const cloneview = props.cloneview;
  const publicView = props.publicView;

  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalMsg, setModalMsg] = useState(undefined);
  const [modalTitle, setModalTitle] = useState(undefined);
  const [onYes, setOnYes] = useState('')
  const [formikValues, setFormikValues] = useState({})
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const hiddenFileInput = React.useRef(null);

  const flattenServices = (services) => {
    let flat_services = [];
    let index = 0;

    services.forEach((service_element) => {
      let service = service_element.service;
      service_element.metrics.forEach((metric) => {
        flat_services.push({index, service, metric})
        index += 1;
      })
    })
    return flat_services
  }

  let write_perm = undefined

  if (publicView) {
    write_perm = false
  }
  else if (cloneview) {
    write_perm = userDetails.is_superuser ||
      userDetails.groups.metricprofiles.length > 0;
  }
  else if (!addview) {
    write_perm = userDetails.is_superuser ||
          userDetails.groups.metricprofiles.indexOf(metricProfile.groupname) >= 0;
  }
  else {
    write_perm = userDetails.is_superuser ||
      userDetails.groups.metricprofiles.length > 0;
  }

  const methods = useForm({
    defaultValues: {
      id: metricProfile.profile.id,
      name: metricProfile.profile.name,
      description: metricProfile.profile.description,
      groupname: metricProfile.groupname,
      view_services: metricProfile.profile.services.length > 0 ?
        historyview ?
          metricProfile.profile.services.sort(sortServices)
        :
          flattenServices(metricProfile.profile.services).sort(sortServices)
      :
        [{ service: "", metric: "" }],
      search_metric: "",
      search_serviceflavour: "",
      metrics_all: metricsAll,
      services_all: servicesAll
    },
    mode: "all",
    resolver: yupResolver(MetricProfilesSchema),
    context: { allServices: servicesAll, allMetrics: metricsAll }
  })

  const { control } = methods

  const searchMetric = useWatch({ control, name: "search_metric" })
  const searchServiceFlavour = useWatch({ control, name: "search_serviceflavour" })
  const listServices = useWatch({ control, name: "view_services" })

  useEffect(() => {
    for (var i=0; i < listServices.length; i++)
      for (var j=0; j < listServices.length; j++)
        if (i !== j && listServices[i].service === listServices[j].service && listServices[i].metric === listServices[j].metric && (listServices[i].isNew || listServices[i].serviceChanged || listServices[i].metricChanged)) {
          methods.setError(`view_services.[${i}].dup`, { type: "custom", message: "Duplicated" })
        }

    if (listServices.length === 0) {
      methods.setValue("view_services", [{ service: "", metric: "" }])
    }
  }, [listServices])

  const onSubmitHandle = async (formValues) => {
    let msg = `Are you sure you want to ${(addview || cloneview) ? "add" : "change"} metric profile?`
    let title = `${(addview || cloneview) ? "Add" : "Change"} metric profile`

    setAreYouSureModal(!areYouSureModal);
    setModalMsg(msg)
    setModalTitle(title)
    setOnYes('change')
    setFormikValues(formValues)
  }

  const onYesCallback = () => {
    if (onYes === 'delete')
      doDelete(formikValues.id);
    else if (onYes === 'change')
      doChange({
          formValues: formikValues,
          servicesList: listServices
        }
      );
  }

  return (
    <BaseArgoView
      resourcename={publicView ? 'Metric profile details' : historyview ? `${metricProfile.profile.name} (${metricProfile.date_created})` : 'metric profile'}
      location={location}
      modal={true}
      cloneview={cloneview}
      clone={true}
      history={!publicView}
      state={{areYouSureModal, 'modalFunc': onYesCallback, modalTitle, modalMsg}}
      toggle={() => setAreYouSureModal(!areYouSureModal)}
      addview={publicView ? !publicView : addview}
      publicview={publicView}
      infoview={historyview}
      submitperm={write_perm}
      extra_button={
        !addview &&
          <ButtonDropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
            <DropdownToggle caret color='secondary'>CSV</DropdownToggle>
            <DropdownMenu>
              <DropdownItem
                onClick={() => {
                  let csvContent = [];
                  listServices.forEach((service) => {
                    csvContent.push({service: service.service, metric: service.metric})
                  })
                  const content = PapaParse.unparse(csvContent);
                  let filename = `${profile_name}.csv`;
                  downloadCSV(content, filename)
                }}
                disabled={addview}
              >
                Export
              </DropdownItem>
              <DropdownItem
                onClick={() => {hiddenFileInput.current.click()}}
              >
                Import
              </DropdownItem>
            </DropdownMenu>
            <input
              type='file'
              data-testid='file_input'
              ref={hiddenFileInput}
              onChange={(e) => {
                PapaParse.parse(e.target.files[0], {
                  header: true,
                  complete: (results) => {
                    var imported = results.data;
                    // remove entries without keys if there is any
                    imported = imported.filter(
                      obj => {
                        return 'service' in obj && 'metric' in obj
                      }
                    )
                    imported.forEach(item => {
                      if (!listServices.some(service => {
                        return service.service === item.service && service.metric == item.metric
                      }))
                        item.isNew = true
                    })
                    methods.resetField("view_services")
                    methods.setValue("view_services", imported.sort(sortServices))
                    methods.trigger()
                  }
                })
              }}
              style={{display: 'none'}}
            />
          </ButtonDropdown>
      }
    >
      <FormProvider { ...methods }>
        <Form onSubmit={ methods.handleSubmit(val => onSubmitHandle(val)) } data-testid="metricprofiles-form">
          <ProfileMain
            description="description"
            grouplist={
              write_perm ?
                userDetails.groups.metricprofiles
              :
                [ methods.getValues("groupname") ]
            }
            profiletype="metric"
            fieldsdisable={ publicView || historyview }
            addview={ addview || cloneview }
          />
          <ParagraphTitle title='Metric instances'/>
          <MetricProfilesComponentContext.Provider value={{
            publicView: publicView,
            historyview: historyview,
            searchMetric: searchMetric,
            searchServiceFlavour: searchServiceFlavour,
            listServices: listServices,
            serviceflavours_all: servicesAll,
            metrics_all: metricsAll
          }}>
            <ServicesList />
          </MetricProfilesComponentContext.Provider>
          {
            (!historyview && write_perm) &&
              <div className="submit-row d-flex align-items-center justify-content-between bg-light p-3 mt-5">
                {
                  !addview && !cloneview ?
                    <Button
                      color="danger"
                      onClick={() => {
                        setModalMsg('Are you sure you want to delete Metric profile?')
                        setModalTitle('Delete metric profile')
                        setAreYouSureModal(!areYouSureModal);
                        setFormikValues(methods.getValues())
                        setOnYes('delete')
                      }}
                    >
                      Delete
                    </Button>
                  :
                    <div></div>
                }
                <Button
                  color="success"
                  id="submit-button"
                  type="submit"
                  disabled={ methods.formState.errors?.view_services?.length > 0 }
                >
                  Save
                </Button>
              </div>
          }
        </Form>
      </FormProvider>
    </BaseArgoView>
  )
}


export const MetricProfilesComponent = (props) => {
  const profile_name = props.match.params.name;
  const addview = props.addview
  const history = props.history;
  const cloneview = props.cloneview;
  const publicView = props.publicView;

  const backend = new Backend();
  const webapi = new WebApi({
    token: props.webapitoken,
    metricProfiles: props.webapimetric,
    serviceTypes: props.webapiservicetypes
  })


  const queryClient = useQueryClient();
  const webapiChangeMutation = useMutation(async (values) => await webapi.changeMetricProfile(values));
  const backendChangeMutation = useMutation(async (values) => await backend.changeObject('/api/v2/internal/metricprofiles/', values));
  const webapiAddMutation = useMutation(async (values) => await webapi.addMetricProfile(values));
  const backendAddMutation = useMutation(async (values) => await backend.addObject('/api/v2/internal/metricprofiles/', values));
  const webapiDeleteMutation = useMutation(async (idProfile) => await webapi.deleteMetricProfile(idProfile));
  const backendDeleteMutation = useMutation(async (idProfile) => await backend.deleteObject(`/api/v2/internal/metricprofiles/${idProfile}`));

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    'userdetails', () => fetchUserDetails(true),
    { enabled: !publicView }
  );

  const { data: backendMP, error: errorBackendMP, isLoading: loadingBackendMP } = useQuery(
    [`${publicView ? 'public_' : ''}metricprofile`, 'backend', profile_name], async () => {
      return await backend.fetchData(`/api/v2/internal/${publicView ? 'public_' : ''}metricprofiles/${profile_name}`);
    },
    {
      enabled: (publicView || !addview),
      initialData: () => {
        if (!addview)
          return queryClient.getQueryData([`${publicView ? 'public_' : ''}metricprofile`, "backend"])?.find(mpr => mpr.name === profile_name)
      }
    }
  )

  const { data: webApiMP, error: errorWebApiMP, isLoading: loadingWebApiMP } = useQuery(
    [`${publicView ? 'public_' : ''}metricprofile`, 'webapi', profile_name],
    () => fetchMetricProfile(webapi, backendMP.apiid),
    {
      enabled: !!backendMP && !addview,
      initialData: () => {
        if (!addview)
          return queryClient.getQueryData([`${publicView ? "public_" : ""}metricprofile`, "webapi"])?.find(profile => profile.id == backendMP.apiid)
      }
    }
  )

  const { data: metricsAll, error: errorMetricsAll, isLoading: loadingMetricsAll } = useQuery(
    'metricsall', () => fetchAllMetrics(),
    { enabled: !publicView }
  )

  const { data: webApiST, errorWebApiST, isLoading: loadingWebApiST} = useQuery(
    ['servicetypes', 'webapi'], async () => {
      return await webapi.fetchServiceTypes();
    },
    { enabled: !!userDetails }
  )

  const doDelete = (idProfile) => {
    webapiDeleteMutation.mutate(idProfile, {
      onSuccess: () => {
        backendDeleteMutation.mutate(idProfile, {
          onSuccess: () => {
            queryClient.invalidateQueries('metricprofile');
            queryClient.invalidateQueries('public_metricprofile');
            NotifyOk({
              msg: 'Metric profile successfully deleted',
              title: 'Deleted',
              callback: () => history.push('/ui/metricprofiles')
            });
          },
          onError: (error) => {
            NotifyError({
              title: 'Internal API error',
              msg: error.message ? error.message : 'Internal API error deleting metric profile'
            })
          }
        })
      },
      onError: (error) => {
        NotifyError({
          title: 'Web API error',
          msg: error.message ? error.message : 'Web API error deleting metric profile'
        })
      }
    })
  }

  const groupMetricsByServices = (servicesFlat) => {
    let services = [];

    servicesFlat.forEach(element => {
      let service = services.filter(e => e.service === element.service);
      if (!service.length)
        services.push({
          'service': element.service,
          'metrics': [element.metric]
        })
      else
        service[0].metrics.push(element.metric)

    })
    return services
  }

  const doChange = ({formValues, servicesList}) => {
    let services = [];
    let dataToSend = new Object()
    const backend_services = [];
    formValues.view_services.forEach((service) => backend_services.push({ service: service.service, metric: service.metric }));

    if (!addview && !cloneview) {
      const { id } = webApiMP
      services = groupMetricsByServices(servicesList);
      dataToSend = {
        id,
        name: profile_name,
        description: formValues.description,
        services
      };
      webapiChangeMutation.mutate(dataToSend, {
        onSuccess: () => {
          backendChangeMutation.mutate({
            apiid: dataToSend.id,
            name: profile_name,
            description: dataToSend.description,
            groupname: formValues.groupname,
            services: backend_services
          }, {
            onSuccess: () => {
              queryClient.invalidateQueries('metricprofile');
              queryClient.invalidateQueries('public_metricprofile');
              NotifyOk({
                msg: 'Metric profile successfully changed',
                title: 'Changed',
                callback: () => history.push('/ui/metricprofiles')
              });
            },
            onError: (error) => {
              NotifyError({
                title: 'Internal API error',
                msg: error.message ? error.message : 'Internal API error changing metric profile'
              })
            }
          })
        },
        onError: (error) => {
          NotifyError({
            title: 'Web API error',
            msg: error.message ? error.message : 'Web API error changing metric profile'
          })
        }
      })
    } else {
      services = groupMetricsByServices(servicesList);
      dataToSend = {
        name: formValues.name,
        description: formValues.description,
        services
      }
      webapiAddMutation.mutate(dataToSend, {
        onSuccess: (data) => {
          backendAddMutation.mutate({
            apiid: data.data.id,
            name: dataToSend.name,
            groupname: formValues.groupname,
            description: formValues.description,
            services: backend_services
          }, {
            onSuccess: () => {
              queryClient.invalidateQueries('metricprofile');
              queryClient.invalidateQueries('public_metricprofile');
              NotifyOk({
                msg: 'Metric profile successfully added',
                title: 'Added',
                callback: () => history.push('/ui/metricprofiles')
              });
            },
            onError: (error) => {
              NotifyError({
                title: 'Internal API error',
                msg: error.message ? error.message : 'Internal API error adding metric profile'
              })
            }
          })
        },
        onError: (error) => {
          NotifyError({
            title: 'Web API error',
            msg: error.message ? error.message : 'Web API error adding metric profile'
          })
        }
      })
    }
  }

  if (loadingUserDetails || loadingBackendMP || loadingWebApiMP || loadingMetricsAll || loadingWebApiST)
    return (<LoadingAnim />)

  else if (errorUserDetails)
    return (<ErrorComponent error={errorUserDetails}/>);

  else if (errorBackendMP)
    return (<ErrorComponent error={errorBackendMP}/>);

  else if (errorWebApiMP)
    return (<ErrorComponent error={errorWebApiMP} />)

  else if (errorMetricsAll)
    return (<ErrorComponent error={errorMetricsAll} />)

  else if (errorWebApiST)
    return (<ErrorComponent error={errorWebApiST} />)

  else if ((addview && webApiST) || (backendMP && webApiMP && webApiST) || (publicView))
  {
    var metricProfile = {
      profile: {
        id: "",
        name: '',
        description: '',
        services: [],
      },
      groupname: '',
      services: undefined
    }

    if (backendMP && webApiMP) {
      metricProfile.profile = webApiMP
      metricProfile.groupname = backendMP.groupname

      if (cloneview)
        metricProfile.profile.name = `Cloned ${metricProfile.profile.name}`
    }

    return (
      <MetricProfilesForm
        { ...props }
        metricProfile={ metricProfile }
        userDetails={ userDetails }
        metricsAll={ metricsAll }
        servicesAll={ webApiST }
        doChange={ doChange }
        doDelete={ doDelete }
      />
    )
  }

  else
    return null
}


export const MetricProfilesList = (props) => {
  const location = props.location;
  const publicView = props.publicView

  const { data: userDetails, error: errorUserDetails, status: statusUserDetails } = useQuery(
    'userdetails', () => fetchUserDetails(true)
  );

  const { data: metricProfiles, error: errorMetricProfiles, status: statusMetricProfiles} = useQuery(
    [`${publicView ? 'public_' : ''}metricprofile`, 'backend'],
    () => fetchBackendMetricProfiles(publicView),
    { enabled: !publicView ? !!userDetails : true }
  );

  const columns = useMemo(() => [
    {
      Header: '#',
      accessor: null,
      column_width: '2%'
    },
    {
      Header: 'Name',
      id: 'name',
      accessor: e =>
        <Link
          to={`/ui/${publicView ? 'public_' : ''}metricprofiles/` + e.name}
        >
          {e.name}
        </Link>,
      column_width: '20%'
    },
    {
      Header: 'Description',
      accessor: 'description',
      column_width: '70%'
    },
    {
      Header: 'Group',
      accessor: 'groupname',
      className: 'text-center',
      Cell: row =>
        <div style={{textAlign: 'center'}}>
          {row.value}
        </div>,
      column_width: '8%'
    }
  ], [])

  if (statusUserDetails === 'loading' || statusMetricProfiles === 'loading')
    return (<LoadingAnim />)

  else if (statusMetricProfiles === 'error')
    return (<ErrorComponent error={errorMetricProfiles}/>);

  else if (statusUserDetails === 'error')
    return (<ErrorComponent error={errorUserDetails}/>);

  else if (metricProfiles) {
    return (
      <BaseArgoView
        resourcename='metric profile'
        location={location}
        listview={true}
        addnew={!publicView}
        addperm={publicView ? false : userDetails.is_superuser || userDetails.groups.metricprofiles.length > 0}
        publicview={publicView}>
        <ProfilesListTable
          data={metricProfiles}
          columns={columns}
          type='metric'
        />
      </BaseArgoView>
    )
  }
  else
    return null
}


const ListDiffElement = ({title, item1, item2}) => {
  let list1 = [];
  let list2 = [];
  for (let i = 0; i < item1.length; i++) {
    list1.push(`service: ${item1[i]['service']}, metric: ${item1[i]['metric']}`)
  }

  for (let i = 0; i < item2.length; i++) {
    list2.push(`service: ${item2[i]['service']}, metric: ${item2[i]['metric']}`)
  }

  return (
    <div id='argo-contentwrap' className='ms-2 mb-2 mt-2 p-3 border rounded'>
      <h6 className='mt-4 font-weight-bold text-uppercase'>{title}</h6>
      <ReactDiffViewer
        oldValue={list2.join('\n')}
        newValue={list1.join('\n')}
        showDiffOnly={false}
        splitView={true}
        hideLineNumbers={true}
      />
    </div>
  )
};


const fetchMetricProfileVersions = async (name) => {
  const backend = new Backend();

  return await backend.fetchData(`/api/v2/internal/tenantversion/metricprofile/${name}`);
}


export const MetricProfileVersionCompare = (props) => {
  const version1 = props.match.params.id1;
  const version2 = props.match.params.id2;
  const name = props.match.params.name;

  const { data: metricProfileVersions, error, status } = useQuery(
    ['metricprofile', 'versions', name], () => fetchMetricProfileVersions(name)
  )

  if (status === 'loading')
    return (<LoadingAnim/>);

  if (status === 'error')
    return (<ErrorComponent error={error}/>);


  else if (metricProfileVersions) {
    const metricProfileVersion1 = metricProfileVersions.find(ver => ver.version === version1).fields;
    const metricProfileVersion2 = metricProfileVersions.find(ver => ver.version === version2).fields;

    const { name: name1, description: description1, metricinstances:
      metricinstances1, groupname: groupname1 } = metricProfileVersion1
    const { name: name2, description: description2, metricinstances:
      metricinstances2, groupname: groupname2 } = metricProfileVersion2

    return (
      <React.Fragment>
        <div className='d-flex align-items-center justify-content-between'>
          <h2 className='ms-3 mt-1 mb-4'>{`Compare ${name} versions`}</h2>
        </div>
        {
          (name1 !== name2) &&
            <DiffElement title='name' item1={name1} item2={name2}/>
        }
        {
          (description1 !== description2) &&
            <DiffElement title='description' item1={description1} item2={description2}/>
        }
        {
          (groupname1 !== groupname2) &&
            <DiffElement title='groupname' item1={groupname1} item2={groupname2}/>
        }
        {
          (metricinstances1 !== metricinstances2) &&
            <ListDiffElement title='metric instances' item1={metricinstances1} item2={metricinstances2}/>
        }
      </React.Fragment>
    );
  } else
    return null;
}


export const MetricProfileVersionDetails = (props) => {
  const name = props.match.params.name;
  const version = props.match.params.version;

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    'userdetails', () => fetchUserDetails(true)
  );

  const { data: metricProfileVersions, error, isLoading: loading } = useQuery(
    ['metricprofile', 'versions', name], () => fetchMetricProfileVersions(name),
    { enabled: !!userDetails }
  )

  if (loadingUserDetails || loading)
    return (<LoadingAnim/>);

  else if (error)
    return (<ErrorComponent error={error}/>);

  else if (errorUserDetails)
    return (<ErrorComponent error={ error } />)

  else if (metricProfileVersions) {
    const instance = metricProfileVersions.find(ver => ver.version === version);
    var metricProfile = {
      profile: {
        id: "",
        name: instance.fields.name,
        description: instance.fields.description,
        services: instance.fields.metricinstances
      },
      groupname: instance.fields.groupname,
      date_created: instance.date_created
    }

    return (
      <MetricProfilesForm
        { ...props }
        historyview={ true }
        metricProfile={ metricProfile }
        userDetails={ userDetails }
      />
    )
  } else
    return null
}
