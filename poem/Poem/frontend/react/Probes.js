import React, { useState, useEffect } from 'react';
import { Backend } from './DataManager';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  LoadingAnim,
  BaseArgoView,
  NotifyOk,
  DiffElement,
  NotifyError,
  ErrorComponent,
  ParagraphTitle,
  DefaultColumnFilter,
  BaseArgoTable,
  DropdownWithFormText
} from './UIElements';
import {
  FormGroup,
  Label,
  FormText,
  Row,
  Col,
  Button,
  InputGroup,
  InputGroupText,
  Input,
  Form,
  FormFeedback
} from 'reactstrap';
import * as Yup from 'yup';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { fetchPackages, fetchProbes, fetchProbeVersion } from './QueryFunctions';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import { CustomButton, CustomDescriptionArea, CustomHeadline, CustomInput, CustomProfilesList, CustomSpan, CustomSubtitle, CustomTable } from './Placeholders';


const ProbeSchema = Yup.object().shape({
  name: Yup.string()
    .matches(/^\S*$/, 'Name cannot contain white spaces')
    .required('Required'),
  pkg: Yup.string()
    .required('Required'),
  repository: Yup.string()
    .url('Invalid url')
    .required('Required'),
  docurl: Yup.string()
    .url('Invalid url')
    .required('Required'),
  description: Yup.string()
    .required('Required'),
  comment: Yup.string()
    .required('Required')
})


const ProbeForm = ({
  probe=undefined,
  name=undefined,
  isTenantSchema=false,
  isHistory=false,
  probe_version=undefined,
  publicView=false,
  addview=false,
  cloneview=false,
  list_packages=[],
  metrictemplatelist=[],
  location=undefined,
}) => {
  const backend = new Backend()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const addMutation = useMutation(async (values) => await backend.addObject('/api/v2/internal/probes/', values))
  const changeMutation = useMutation(async (values) => await backend.changeObject('/api/v2/internal/probes/', values))
  const deleteMutation = useMutation(async () => await backend.deleteObject(`/api/v2/internal/probes/${name}`))

  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalFlag, setModalFlag] = useState(undefined)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)

  const { control, getValues, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      id: `${probe ? probe.id : ''}`,
      name: `${probe ? probe.name : ''}`,
      version: `${probe ? probe.version : ''}`,
      pkg: `${probe ? probe.package : ''}`,
      repository: `${probe ? probe.repository : ''}`,
      docurl: `${probe ? probe.docurl : ''}`,
      description: `${probe ? probe.description : ''}`,
      comment: `${probe ? probe.comment : ''}`,
      update_metrics: false
    },
    resolver: yupResolver(ProbeSchema),
    mode: "all"
  })

  const packageField = useWatch({ control, name: "pkg" })

  useEffect(() => {
    let version = ""
    try {
      version = packageField.split('(')[1].slice(0, -1)
    } catch(err) {
      version = ""
    }
    setValue("version", version)
  }, [packageField, setValue])

  function toggleAreYouSure() {
    setAreYouSureModal(!areYouSureModal)
  }

  function onSubmitHandle() {
    let msg = `Are you sure you want to ${addview || cloneview ? 'add' : 'change'} probe?`
    let title = `${addview || cloneview ? 'Add' : 'Change'} probe`

    setModalMsg(msg)
    setModalTitle(title)
    setModalFlag('submit')
    toggleAreYouSure()
  }

  function doChange() {
    let formValues = getValues()

    const baseSendValues = new Object({
      name: formValues.name,
      package: formValues.pkg,
      repository: formValues.repository,
      docurl: formValues.docurl,
      description: formValues.description,
      comment: formValues.comment
    });

    if (addview || cloneview) {
      let cloned_from = undefined;
      if (cloneview) {
        cloned_from = formValues.id;
      } else {
        cloned_from = '';
      }

      addMutation.mutate( { ...baseSendValues, cloned_from: cloned_from }, {
        onSuccess: () => {
          queryClient.invalidateQueries('public_probe');
          queryClient.invalidateQueries('probe');
          NotifyOk({
            msg: 'Probe successfully added',
            title: 'Added',
            callback: () => navigate('/ui/probes')
          })
        },
        onError: (error) => {
          NotifyError({
            title: 'Error',
            msg: error.message ? error.message : 'Error adding probe'
          })
        }
      })
    } else {
      changeMutation.mutate(
        { ...baseSendValues, id: formValues.id, update_metrics: formValues.update_metrics }, {
          onSuccess: () => {
            queryClient.invalidateQueries('public_probe');
            queryClient.invalidateQueries('probe');
            NotifyOk({
              msg: 'Probe successfully changed',
              title: 'Changed',
              callback: () => navigate('/ui/probes')
            })
          },
          onError: (error) => {
            NotifyError({
              title: 'Error',
              msg: error.message ? error.message : 'Error changing probe'
            })
          }
        }
      )
    }
  }

  function doDelete() {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries('public_probe');
        queryClient.invalidateQueries('probe');
        NotifyOk({
          msg: 'Probe successfully deleted',
          title: 'Deleted',
          callback: () => navigate('/ui/probes')
        })
      },
      onError: (error) => {
        NotifyError({
          title: 'Error',
          msg: error.message ? error.message : 'Error deleting probe.'
        })
      }
    })
  }

  return (
    <BaseArgoView
      resourcename={ `${(publicView || isTenantSchema) ? 'Probe details' : isHistory ? `${name} (${probe_version})` : 'probe'}` }
      infoview={ isHistory }
      location={ location }
      addview={ addview }
      cloneview={ cloneview }
      clone={ !isTenantSchema }
      tenantview={ isTenantSchema }
      publicview={ publicView }
      modal={ !isTenantSchema }
      state={{
        areYouSureModal,
        modalTitle,
        modalMsg,
        'modalFunc': modalFlag === 'submit' ?
          doChange
        :
          modalFlag === 'delete' ?
            doDelete
          :
            undefined
      }}
      toggle={ toggleAreYouSure }
    >
      <Form onSubmit={ handleSubmit(onSubmitHandle) }>
        <FormGroup>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroupText>Name</InputGroupText>
                <Controller
                  name="name"
                  control={ control }
                  render={ ({ field }) =>
                    <Input
                      { ...field }
                      className={ `form-control ${errors?.name && "is-invalid"}` }
                      data-testid="name"
                      disabled={ isTenantSchema || isHistory || publicView }
                    />
                  }
                />
                <ErrorMessage
                  errors={ errors }
                  name="name"
                  render={ ({ message }) =>
                    <FormFeedback invalid="true" className="end-0">
                      { message }
                    </FormFeedback>
                  }
                />
              </InputGroup>
              <FormText color="muted">
                Name of this probe.
              </FormText>
            </Col>
            <Col md={2}>
              <InputGroup>
                <InputGroupText>Version</InputGroupText>
                <Controller
                  name="version"
                  control={ control }
                  render={ ({ field }) =>
                    <Input
                      { ...field }
                      data-testid="version"
                      className="form-control"
                      disabled={ true }
                    />
                  }
                />
              </InputGroup>
              <FormText color="muted">
                Version of the probe.
              </FormText>
            </Col>
            {
              (!addview && !cloneview && !isTenantSchema && !isHistory && !publicView) &&
                <Col md={2}>
                  <Row>
                    <FormGroup check inline className='ms-3'>
                      <Controller
                        name="update_metrics"
                        control={ control }
                        render={ ({ field }) =>
                          <Input
                            { ...field }
                            type="checkbox"
                            onChange={ e => setValue("update_metrics", e.target.checked) }
                            checked={ field.value }
                          />
                        }
                      />
                      <Label check for="update_metrics">Update metric templates</Label>
                    </FormGroup>
                  </Row>
                  <Row>
                    <FormText color='muted'>
                      Update all associated metric templates.
                    </FormText>
                  </Row>
                </Col>
            }
          </Row>
          <Row className='mt-3'>
            <Col md={8}>
              <InputGroup>
                <InputGroupText>Package</InputGroupText>
                <Controller
                  name="pkg"
                  control={ control }
                  render={ ({ field }) =>
                    (isTenantSchema || isHistory || publicView) ?
                      <Input
                        { ...field }
                        data-testid='pkg'
                        className='form-control'
                        disabled={ true }
                      />
                    :
                      <DropdownWithFormText
                        forwardedRef={ field.ref }
                        error={ errors.pkg }
                        onChange={ e => {
                          setValue("pkg", e.value)
                        }}
                        options={ list_packages }
                        value={ field.value }
                      />
                  }
                />
              </InputGroup>
              <FormText color='muted'>
                Probe is part of selected package.
              </FormText>
            </Col>
          </Row>
        </FormGroup>
        <FormGroup>
          <ParagraphTitle title='Probe metadata'/>
          <Row className='mt-4 mb-3 align-items-top'>
            <Col md={8}>
              <InputGroup>
                <InputGroupText>Repository</InputGroupText>
                <Controller
                  name="repository"
                  control={ control }
                  render={ ({ field }) =>
                    (isTenantSchema || isHistory || publicView) ?
                      <div className='form-control' style={{backgroundColor: '#f8f9fa', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        <a href={ field.value } style={{'whiteSpace': 'nowrap'}}>{ field.value }</a>
                      </div>
                    :
                      <Input
                        { ...field }
                        data-testid="repository"
                        name="repository"
                        className={`form-control ${errors?.repository && "is-invalid"}`}
                      />
                  }
                />
                <ErrorMessage
                  errors={ errors }
                  name="repository"
                  render={ ({ message }) =>
                    <FormFeedback invalid="true" className="end-0">
                      { message }
                    </FormFeedback>
                  }
                />
              </InputGroup>
              <FormText color='muted'>
                Probe repository URL.
              </FormText>
            </Col>
          </Row>
          <Row className='mb-3 align-items-top'>
            <Col md={8}>
              <InputGroup>
                <InputGroupText>Documentation</InputGroupText>
                <Controller
                  name="docurl"
                  control={ control }
                  render={ ({ field }) =>
                    (isTenantSchema || isHistory || publicView) ?
                      <div className='form-control' style={{backgroundColor: '#f8f9fa', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        <a href={ field.value } style={{'whiteSpace': 'nowrap'}}>{ field.value }</a>
                      </div>
                    :
                      <Input
                        { ...field }
                        data-testid="docurl"
                        className={`form-control ${errors?.docurl && "is-invalid"}`}
                      />
                  }
                />
                <ErrorMessage
                  errors={ errors }
                  name="docurl"
                  render={ ({ message }) =>
                    <FormFeedback invalid="true" className="end-0">
                      { message }
                    </FormFeedback>
                  }
                />
              </InputGroup>
              <FormText color='muted'>
                Documentation URL.
              </FormText>
            </Col>
          </Row>
          <Row className='mb-3 align-items-top'>
            <Col md={8}>
              <Label for="description">Description</Label>
              <Controller
                name="description"
                control={ control }
                render={ ({ field }) =>
                  <textarea
                    { ...field }
                    id="description"
                    rows="15"
                    className={ `form-control ${errors?.description && "is-invalid"}` }
                    disabled={ isTenantSchema || isHistory || publicView }
                  />
                }
              />
              <ErrorMessage
                errors={ errors }
                name="description"
                render={ ({ message }) =>
                  <FormFeedback invalid="true" className="end-0">
                    { message }
                  </FormFeedback>
                }
              />
              <FormText color='muted'>
                Free text description outlining the purpose of this probe.
              </FormText>
            </Col>
          </Row>
          <Row className='mb-3 align-items-top'>
            <Col md={8}>
              <Label for='comment'>Comment</Label>
              <Controller
                name="comment"
                control={ control }
                render={ ({ field }) =>
                  <textarea
                    { ...field }
                    id="comment"
                    rows="5"
                    className={ `form-control ${errors?.comment && "is-invalid"}` }
                    disabled={ isTenantSchema || isHistory || publicView }
                  />
                }
              />
              <ErrorMessage
                errors={ errors }
                name="comment"
                render={ ({ message }) =>
                  <FormFeedback invalid="true" className="end-0">
                    { message }
                  </FormFeedback>
                }
              />
              <FormText color='muted'>
                Short comment about this version.
              </FormText>
            </Col>
          </Row>
          {
            (!isHistory && !addview && !cloneview) &&
              <Row>
                <Col md={8}>
                  {
                    metrictemplatelist.length > 0 &&
                    <div>
                      Metric templates:
                      <div>
                        {
                          metrictemplatelist
                            .map((met, i) => <Link
                              key={i}
                              to={
                                publicView ?
                                  `/ui/public_metrictemplates/${met}`
                                :
                                  isTenantSchema ?
                                    `/ui/probes/${getValues("name")}/${met}`
                                  :
                                    `/ui/metrictemplates/${met}`
                                }>
                              {met}
                            </Link>
                            ).reduce((prev, curr) => [prev, ', ', curr])
                        }
                      </div>
                    </div>
                  }
                </Col>
              </Row>
          }
        </FormGroup>
        {
          (!publicView && !isTenantSchema && !isHistory) &&
            <div className="submit-row d-flex align-items-center justify-content-between bg-light p-3 mt-5">
              {
                (!addview && !cloneview && !publicView) ?
                  <Button
                    color='danger'
                    onClick={() => {
                      setModalMsg('Are you sure you want to delete probe?');
                      setModalTitle('Delete probe');
                      setModalFlag('delete');
                      toggleAreYouSure();
                    }}
                  >
                    Delete
                  </Button>
                :
                  <div></div>
              }
              <Button
                color='success'
                id='submit-button'
                type='submit'
              >
                Save
              </Button>
            </div>
      }
      </Form>
    </BaseArgoView>
  )
}


const fetchProbe = async (publicView, name) => {
  const backend = new Backend();

  return await backend.fetchData(`/api/v2/internal/${publicView ? 'public_' : ''}probes/${name}`);
}


const fetchMetrics = async (publicView, name, version) => {
  const backend = new Backend();

  return await backend.fetchData(`/api/v2/internal/${publicView ? 'public_' : ''}metricsforprobes/${name}(${version})`);
}


export const ProbeList = (props) => {
  const location = useLocation();
  const publicView = props.publicView;
  const isTenantSchema = props.isTenantSchema;

  const { data: probes, error, isLoading: loading } = useQuery(
    `${publicView ? 'public_' : ''}probe`, () => fetchProbes(publicView)
  );

  const columns = React.useMemo(() => [
    {
      Header: '#',
      accessor: null,
      column_width: '2%'
    },
    {
      Header: 'Name',
      column_width: '20%',
      accessor: 'name',
      Cell: e =>
        <Link
          to={`/ui/${publicView ? 'public_' : ''}probes/${e.value}`}
        >
          {e.value}
        </Link>,
      Filter: DefaultColumnFilter
    },
    {
      Header: '#versions',
      accessor: 'nv',
      column_width: '3%',
      Cell: e =>
        <div style={{textAlign: 'center'}}>
          <Link to={`/ui/${publicView ? 'public_' : ''}probes/${e.row.original.name}/history`}>
            {e.value}
          </Link>
        </div>,
      disableFilters: true
    },
    {
      Header: 'Package',
      column_width: '20%',
      accessor: 'package',
      Filter: DefaultColumnFilter
    },
    {
      Header: 'Description',
      column_width: '55%',
      accessor: 'description',
      Filter: DefaultColumnFilter
    }
  ], [publicView]);

  if (loading)
    return (<CustomProfilesList pathname={window.location.pathname}/>);

  else if (error)
    return (<ErrorComponent error={error.message}/>);

  else if (!loading && probes) {
    return (
      <BaseArgoView
        resourcename='probe'
        location={location}
        listview={true}
        addnew={!isTenantSchema && !publicView}
      >
        <BaseArgoTable
          data={probes}
          columns={columns}
          page_size={50}
          resourcename='probes'
          filter={true}
        />
      </BaseArgoView>
    );
  } else
    return null;
};


export const ProbeComponent = (props) => {
  let { name } = useParams();   
  const location = useLocation();
  const addview = props.addview;
  const cloneview = props.cloneview;
  const publicView = props.publicView;
  const isTenantSchema = props.isTenantSchema;

  const queryClient = useQueryClient();

  const { data: probe, error: probeError, isLoading: probeLoading } = useQuery(
    [`${publicView ? 'public_' : ''}probe`, name], () => fetchProbe(publicView, name),
    {
      enabled: !addview,
      initialData: () => {
        return queryClient.getQueryData(`${publicView ? 'public_' : ''}probe`)?.find(prb => prb.name === name)
      }
    }
  );

  const { data: metricTemplates, error: metricTemplatesError, isLoading: metricTemplatesLoading } = useQuery(
    [`${publicView ? 'public_' : ''}probe`, 'metrics', name], () => fetchMetrics(publicView, probe.name, probe.version),
    { enabled: !!probe }
  );

  const { data: packages, error: packagesError, isLoading: packagesLoading } = useQuery(
    `${publicView ? 'public_' : ''}package`, () => fetchPackages(publicView),
  )

  const loading = probeLoading || metricTemplatesLoading || packagesLoading;

  if (loading)
    return(
      <>
        {/\/add/.test(window.location.pathname) ? 
        <div className='placeholder-glow d-flex flex-row align-items-center justify-content-start mb-3 mt-3'>
          <CustomHeadline width="155px" height="38.4px"/>
      </div>
        :
        <div className='placeholder-glow d-flex flex-row align-items-center justify-content-between mb-3 mt-3'>
          <CustomHeadline width="357px" height="38.4px"/>
          <CustomButton width="78px" height="37.6px" custStyle="mt-1 mb-4" />
        </div>
        }
        <Form className='ms-2 mb-2 mt-2 p-3 border placeholder-glow rounded d-flex flex-column'>
          <Row>
            <Col md={5}>
              <CustomInput height="37.6px" width="100%" />
              <CustomSpan custStyle="mt-1 mb-3" height="10px" width="25%" />
            </Col>
            <Col md={3} className='ms-2'>
              <CustomInput height="37.6px" width="100%" />
              <CustomSpan custStyle="mt-1 mb-3" height="10px" width="25%" />
            </Col>
          </Row>
          <Col md={8}>
            <CustomInput height="37.6px" width="100%" />
            <CustomSpan custStyle="mt-1 mb-3" height="10px" width="25%" />
          </Col>
          <CustomSubtitle height="37.6px" custStyle="mt-2 mb-4" />
          <Col md={8}>
            <CustomInput height="37.6px" width="100%" />
            <CustomSpan custStyle="mt-1 mb-3" height="10px" width="25%" />
          </Col>
          <Col md={8}>
            <CustomInput height="37.6px" width="100%" />
            <CustomSpan custStyle="mt-1 mb-3" height="10px" width="25%" />
          </Col>
          <CustomDescriptionArea heightTable="373px" widthTable="66.5%" heightBottom="14.4px" widthBottom="391px" />
          <CustomDescriptionArea heightTable="133px" widthTable="66.5%" heightBottom="14.4px" widthBottom="209px" custStyle="mt-3" />
          <CustomSpan custStyle="mt-3" height="23px" width="160px" />
          <CustomSpan custStyle="mt-1 mb-3" height="23px" width="192px" />
        </Form>
      </>  
    )

  else if (probeError)
    return (<ErrorComponent error={probeError.message}/>);

  else if (metricTemplatesError)
    return (<ErrorComponent error={metricTemplatesError.message}/>);

  else if (packagesError)
    return (<ErrorComponent error={packagesError.error}/>);

  else if ((addview || (probe && metricTemplates)) && packages) {
    return (
      <ProbeForm
        probe={ probe ? probe : undefined }
        name={ name }
        addview={ addview }
        cloneview={ cloneview }
        publicView={ publicView }
        isTenantSchema={ isTenantSchema }
        list_packages={ packages.map(pkg => `${pkg.name} (${pkg.version})`) }
        metrictemplatelist={ metricTemplates ? metricTemplates : [] }
        location={ location }
      />
    )
  } else
    return null
};


export const ProbeVersionCompare = (props) => {
  let { name, id1: version1, id2: version2 } = useParams();
  const publicView = props.publicView;

  const { data: versions, error, isLoading: loading } = useQuery(
    [`${publicView ? 'public_' : ''}probe`, 'version', name], () => fetchProbeVersion(publicView, name)
  )

  if (loading)
    return (
      <>
        <CustomHeadline height="38.4px" width="383px" />
        <div className='ms-3 mt-4 placeholder-glow rounded'>
          <CustomTable height="230px" />
        </div>
      </>
    );

  else if (error)
    return (<ErrorComponent error={error}/>);

  else if (versions) {
    var probe1 = undefined;
    var probe2 = undefined;

    versions.forEach(ver => {
      if (ver.version == version1)
        probe1 = ver.fields;

      if (ver.version == version2)
        probe2 = ver.fields;
    })

    return (
      <React.Fragment>
        <div className="d-flex align-items-center justify-content-between">
          <h2 className='ms-3 mt-1 mb-4'>{`Compare ${name}`}</h2>
        </div>
        {
          (probe1.name !== probe2.name) &&
            <DiffElement title='name' item1={probe1.name} item2={probe2.name}/>
        }

        {
          (probe1.version !== probe2.version) &&
            <DiffElement title='version' item1={probe1.version} item2={probe2.version}/>
        }

        {
          (probe1.package !== probe2.package) &&
            <DiffElement title='package' item1={probe1.package} item2={probe2.package}/>
        }

        {
          (probe1.description !== probe2.description) &&
            <DiffElement title='description' item1={probe1.description} item2={probe2.description}/>
        }

        {
          (probe1.repository !== probe2.repository) &&
            <DiffElement title='repository' item1={probe1.repository} item2={probe2.repository}/>
        }

        {
          (probe1.docurl !== probe2.docurl) &&
            <DiffElement title={'documentation'} item1={probe1.docurl} item2={probe2.docurl}/>
        }
        {
          (probe1.comment !== probe2.comment) &&
            <DiffElement title={'comment'} item1={probe1.comment} item2={probe2.comment}/>
        }
      </React.Fragment>
    );
  }
  else
    return null;
};


export const ProbeVersionDetails = (props) => {
  let { name, version } = useParams();
  const publicView = props.publicView;

  const { data: versions, error, isLoading: loading } = useQuery(
    [`${publicView ? 'public_' : ''}probe`, 'version', name], () => fetchProbeVersion(publicView, name)
  )

  if (loading)
    return(
      <>
        <CustomHeadline width="357px" height="38.4px"/>
        <Form className='ms-2 mb-2 mt-2 p-3 border placeholder-glow rounded d-flex flex-column'>
          <Row>
            <Col md={6}>
              <CustomInput height="37.6px" width="100%" />
              <CustomSpan custStyle="mt-1 mb-3" height="10px" width="25%" />
            </Col>
            <Col md={2} className='ms-2'>
              <CustomInput height="37.6px" width="100%" />
              <CustomSpan custStyle="mt-1 mb-3" height="10px" width="15%" />
            </Col>
          </Row>
          <Col md={8}>
            <CustomInput height="37.6px" width="100%" />
            <CustomSpan custStyle="mt-1 mb-3" height="10px" width="25%" />
          </Col>
          <CustomSubtitle height="37.6px" custStyle="mt-2 mb-4" />
          <Col md={8}>
            <CustomInput height="37.6px" width="100%" />
            <CustomSpan custStyle="mt-1 mb-3" height="10px" width="25%" />
          </Col>
          <Col md={8}>
            <CustomInput height="37.6px" width="100%" />
            <CustomSpan custStyle="mt-1 mb-3" height="10px" width="25%" />
          </Col>
          <CustomDescriptionArea heightTable="373px" widthTable="66.5%" heightBottom="14.4px" widthBottom="391px" />
          <CustomDescriptionArea heightTable="133px" widthTable="66.5%" heightBottom="14.4px" widthBottom="209px" custStyle="mt-3" />
        </Form>
      </>  
    )

  else if (error)
    return (<ErrorComponent error={error}/>);

  else if (versions) {
    var probe = undefined;
    versions.forEach(ver => {
      if (ver.version === version)
        probe = ver.fields;
    })

    return (
      <ProbeForm
        probe={ probe }
        name={ name }
        probe_version={ version }
        isHistory={ true }
      />
    )
  }
  else
    return null
}
