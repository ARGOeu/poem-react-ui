import React, { useState, useEffect } from 'react';
import { Backend } from './DataManager';
import { Link } from 'react-router-dom';
import {
  LoadingAnim,
  BaseArgoView,
  NotifyOk,
  Checkbox,
  FancyErrorMessage,
  AutocompleteField,
  DiffElement,
  NotifyError,
  ErrorComponent,
  ParagraphTitle,
  ModalAreYouSure
} from './UIElements';
import ReactTable from 'react-table-6';
import {
  FormGroup,
  Label,
  FormText,
  Row,
  Col,
  Button,
  InputGroup,
  InputGroupAddon } from 'reactstrap';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useQuery, queryCache } from 'react-query';


const ProbeSchema = Yup.object().shape({
  name: Yup.string()
    .matches(/^\S*$/, 'Name cannot contain white spaces')
    .required('Required'),
  package: Yup.string()
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
});


const LinkField = ({
  field: { value },
  ...props
}) => (
  <div className='form-control' style={{backgroundColor: '#e9ecef', overflow: 'hidden', textOverflow: 'ellipsis'}}>
    <a href={value} style={{'whiteSpace': 'nowrap'}}>{value}</a>
  </div>
)


const ProbeForm = ({
  isTenantSchema=false,
  isHistory=false,
  publicView=false,
  errors={
    name: undefined,
    package: undefined,
    repository: undefined,
    docurl: undefined,
    comment: undefined
  },
  addview=false,
  cloneview=false,
  list_packages=[],
  setFieldValue=undefined,
  values=undefined,
  onSelect=undefined,
  metrictemplatelist=[],
  version=undefined
}) =>
  <>
    <FormGroup>
      <Row>
        <Col md={6}>
          <InputGroup>
            <InputGroupAddon addonType='prepend'>Name</InputGroupAddon>
            <Field
              type='text'
              name='name'
              className={`form-control ${errors.name && 'border-danger'}`}
              id='name'
              disabled={isTenantSchema || isHistory || publicView}
            />
          </InputGroup>
          {
            errors.name &&
              FancyErrorMessage(errors.name)
          }
          <FormText color="muted">
            Name of this probe.
          </FormText>
        </Col>
        <Col md={2}>
          <InputGroup>
            <InputGroupAddon addonType='prepend'>Version</InputGroupAddon>
            <Field
              type='text'
              name='version'
              className='form-control'
              value={version}
              id='version'
              disabled={true}
            />
          </InputGroup>
          <FormText color="muted">
            Version of the probe.
          </FormText>
        </Col>
        {
          (!addview && !cloneview && !isTenantSchema && !isHistory && !publicView) &&
            <Col md={2}>
              <Field
                component={Checkbox}
                name='update_metrics'
                className='form-control'
                id='checkbox'
                label='Update metric templates'
              />
              <FormText color='muted'>
                Update all associated metric templates.
              </FormText>
            </Col>
        }
      </Row>
      <Row className='mt-3'>
        <Col md={8}>
          {
            (isTenantSchema || isHistory || publicView) ?
              <InputGroup>
                <InputGroupAddon addonType='prepend'>Package</InputGroupAddon>
                <Field
                  type='text'
                  name='package'
                  className='form-control'
                  id='package'
                  disabled={true}
                />
              </InputGroup>
            :
              <>
                <AutocompleteField
                  setFieldValue={setFieldValue}
                  lists={list_packages}
                  icon='packages'
                  field='package'
                  val={values.package}
                  onselect_handler={onSelect}
                  req={errors.package}
                  label='Package'
                />
                {
                  errors.package &&
                    FancyErrorMessage(errors.package)
                }
              </>
          }
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
            <InputGroupAddon addonType='prepend'>Repository</InputGroupAddon>
            {
              (isTenantSchema || isHistory || publicView) ?
                <Field
                  component={LinkField}
                  name='repository'
                  className='form-control'
                  id='repository'
                  disabled={true}
                />
              :
                <Field
                  type='text'
                  name='repository'
                  className={`form-control ${errors.repository && 'border-danger'}`}
                  id='repository'
                />
            }
          </InputGroup>
          {
            errors.repository &&
              FancyErrorMessage(errors.repository)
          }
          <FormText color='muted'>
            Probe repository URL.
          </FormText>
        </Col>
      </Row>
      <Row className='mb-3 align-items-top'>
        <Col md={8}>
          <InputGroup>
            <InputGroupAddon addonType='prepend'>Documentation</InputGroupAddon>
            {
              (isTenantSchema || isHistory || publicView) ?
                <Field
                  component={LinkField}
                  name='docurl'
                  className='form-control'
                  id='docurl'
                  disabled={true}
                />
              :
                <Field
                  type='text'
                  name='docurl'
                  className={`form-control ${errors.docurl && 'border-danger'}`}
                  id='docurl'
                />
            }
          </InputGroup>
          {
            errors.docurl &&
              FancyErrorMessage(errors.docurl)
          }
          <FormText color='muted'>
            Documentation URL.
          </FormText>
        </Col>
      </Row>
      <Row className='mb-3 align-items-top'>
        <Col md={8}>
          <Label for='description'>Description</Label>
          <Field
            component='textarea'
            name='description'
            rows='15'
            className={`form-control ${errors.description && 'border-danger'}`}
            id='description'
            disabled={isTenantSchema || isHistory || publicView}
          />
          {
            errors.description &&
              FancyErrorMessage(errors.description)
          }
          <FormText color='muted'>
            Free text description outlining the purpose of this probe.
          </FormText>
        </Col>
      </Row>
      <Row className='mb-3 align-items-top'>
        <Col md={8}>
          <Label for='comment'>Comment</Label>
          <Field
            component='textarea'
            name='comment'
            rows='5'
            className={`form-control ${errors.comment && 'border-danger'}`}
            id='comment'
            disabled={isTenantSchema || isHistory || publicView}
          />
          {
            errors.comment &&
              FancyErrorMessage(errors.comment)
          }
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
                          .map((e, i) => <Link
                            key={i}
                            to={
                              publicView ?
                                `/ui/public_metrictemplates/${e}`
                              :
                                isTenantSchema ?
                                  `/ui/probes/${values.name}/${e}`
                                :
                                  `/ui/metrictemplates/${e}`
                            }>
                              {e}
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
  </>


export const ProbeList = (props) => {
  const location = props.location;
  const publicView = props.publicView;

  const [searchName, setSearchName] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  const [searchPackage, setSearchPackage] = useState('');

  const backend = new Backend();

  const { data: listProbes, error: listProbesError, isLoading: listProbesLoading } = useQuery(
    'probe_listview', async () => {
      let probes = await backend.fetchData(`/api/v2/internal/${publicView ? 'public_' : ''}probes`);
      return probes;
    }
  );

  const { data: isTenantSchema, isLoading: isTenantSchemaLoading } = useQuery(
    'probe_listview_schema', async () => {
      let schema = backend.isTenantSchema();
      return schema;
    }
  );

  if (listProbesLoading || isTenantSchemaLoading)
    return (<LoadingAnim/>);

  else if (listProbesError)
    return (<ErrorComponent error={listProbesError.message}/>);

  else {
    const columns = [
      {
        Header: '#',
        id: 'row',
        minWidth: 12,
        Cell: (row) =>
          <div style={{textAlign: 'center'}}>
            {row.index + 1}
          </div>
      },
      {
        Header: 'Name',
        id: 'name',
        minWidth: 80,
        accessor: e =>
          <Link to={`/ui/${publicView ? 'public_' : ''}probes/${e.name}`}>
            {e.name}
          </Link>,
        filterable: true,
        Filter: (
          <input
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder='Search by name'
            style={{width: "100%"}}
          />
        )
      },
      {
        Header: '#versions',
        id: 'nv',
        minWidth: 25,
        accessor: e =>
          <Link to={`/ui/${publicView ? 'public_' : ''}probes/${e.name}/history`}>
            {e.nv}
          </Link>,
        Cell: row =>
          <div style={{textAlign: 'center'}}>
            {row.value}
          </div>
      },
      {
        Header: 'Package',
        minWidth: 120,
        accessor: 'package',
        filterable: true,
        Filter: (
          <input
            type='text'
            placeholder='Search by package'
            value={searchPackage}
            onChange={e => setSearchPackage(e.target.value)}
            style={{width: '100%'}}
          />
        ),
        filterMethod:
          (filter, row) =>
            row[filter.id] !== undefined ? String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase()) : true
      },
      {
        Header: 'Description',
        minWidth: 200,
        accessor: 'description',
        filterable: true,
        Filter: (
          <input
            type='text'
            placeholder='Search by description'
            value={searchDescription}
            onChange={e=> setSearchDescription(e.target.value)}
            style={{width: '100%'}}
          />
        ),
        filterMethod:
          (filter, row) =>
            row[filter.id] !== undefined ? String(row[filter.id]).toLowerCase().includes(filter.value.toLowerCase()) : true
      }
    ];

    var list_probe = listProbes;
    if (searchName) {
      list_probe = list_probe.filter(row =>
        row.name.toLowerCase().includes(searchName.toLowerCase())
      );
    };

    if (searchDescription) {
      list_probe = list_probe.filter(row =>
        row.description.toLowerCase().includes(searchDescription.toLowerCase())
      );
    };

    if (searchPackage) {
      list_probe = list_probe.filter(row =>
        row.package.toLowerCase().includes(searchPackage.toLowerCase())
      );
    };

    return (
      <BaseArgoView
        resourcename='probe'
        location={location}
        listview={true}
        addnew={!isTenantSchema && !publicView}
      >
        <ReactTable
          data={list_probe}
          columns={columns}
          className='-highlight'
          defaultPageSize={50}
          rowsText='probes'
          getTheadThProps={() => ({className: 'table-active font-weight-bold p-2'})}
        />
      </BaseArgoView>
    );
  };
};


export const ProbeComponent = (props) => {
  const name = props.match.params.name;
  const addview = props.addview;
  const cloneview = props.cloneview;
  const location = props.location;
  const history = props.history;
  const publicView = props.publicView;
  const backend = new Backend();
  const querykey = `probe_${addview ? `addview` : `${name}_${cloneview ? 'cloneview' : `${publicView ? 'publicview' : 'changeview'}`}`}`;

  const apiListPackages = `/api/v2/internal/${publicView ? 'public_' : ''}packages`;
  const apiProbeName = `/api/v2/internal/${publicView ? 'public_' : ''}probes`;
  const apiMetricsForProbes = `/api/v2/internal/${publicView ? 'public_' : ''}metricsforprobes`;

  const [areYouSureModal, setAreYouSureModal] = useState(false);
  const [modalFlag, setModalFlag] = useState(undefined);
  const [modalTitle, setModalTitle] = useState(undefined);
  const [modalMsg, setModalMsg] = useState(undefined);
  const [formValues, setFormValues] = useState(undefined);

  const { data: probe, error: probeError, isLoading: probeLoading } = useQuery(
    `${querykey}_probe`, async () => {
      let prb = {
        'id': '',
        'name': '',
        'version': '',
        'package': '',
        'repository': '',
        'docurl': '',
        'description': '',
        'comment': ''
      };
      if (!addview)
        prb = await backend.fetchData(`${apiProbeName}/${name}`);
      return prb;
    }
  );

  const { data: isTenantSchema, isLoading: isTenantSchemaLoading } = useQuery(
    `${querykey}_schema`, async () => {
      let schema = await backend.isTenantSchema();
      return schema;
    }
  );

  const { data: metricTemplateList, error: metricTemplateListError, isLoading: metricTemplateListLoading } = useQuery(
    `${querykey}_metrictemplates`, async () => {
      let metrics = await backend.fetchData(`${apiMetricsForProbes}/${probe.name}(${probe.version})`);
      return metrics; },
    { enabled: probe }
  );

  const { data: listPackages, error: listPackagesError, isLoading: listPackagesLoading } = useQuery(
    `${querykey}_packages`, async () => {
      let pkgs = await backend.fetchData(apiListPackages);
      let list_packages = [];
      pkgs.forEach(pkg => list_packages.push(`${pkg.name} (${pkg.version})`));
      return list_packages;
    }
  );

  function toggleAreYouSure() {
    setAreYouSureModal(!areYouSureModal);
  };

  function onSubmitHandle(values, actions) {
    let msg = `Are you sure you want to ${addview || cloneview ? 'add' : 'change'} probe?`;
    let title = `${addview || cloneview ? 'Add' : 'Change'} probe`;

    setFormValues(values);
    setModalMsg(msg);
    setModalTitle(title);
    setModalFlag('submit');
    toggleAreYouSure();
  };

  async function doChange() {
    if (addview || cloneview) {
      let cloned_from = undefined;
      if (cloneview) {
        cloned_from = formValues.id;
      } else {
        cloned_from = '';
      }

      let response = await backend.addObject(
        '/api/v2/internal/probes/',
        {
          name: formValues.name,
          package: formValues.package,
          repository: formValues.repository,
          docurl: formValues.docurl,
          description: formValues.description,
          comment: formValues.comment,
          cloned_from: cloned_from
        }
      );
      if (!response.ok) {
        let add_msg = '';
        try {
          let json = await response.json();
          add_msg = json.detail;
        } catch(err) {
          add_msg = 'Error adding probe';
        }
        NotifyError({
          title: `Error: ${response.status} ${response.statusText}`,
          msg: add_msg
        });
      } else {
        NotifyOk({
          msg: 'Probe successfully added',
          title: 'Added',
          callback: () => history.push('/ui/probes')
        });
      };
    } else {
      let response = await backend.changeObject(
        '/api/v2/internal/probes/',
        {
          id: formValues.id,
          name: formValues.name,
          package: formValues.package,
          repository: formValues.repository,
          docurl: formValues.docurl,
          description: formValues.description,
          comment: formValues.comment,
          update_metrics: formValues.update_metrics
        }
      );
      if (!response.ok) {
        let change_msg = '';
        try {
          let json = await response.json();
          change_msg = json.detail;
        } catch(err) {
          change_msg = 'Error changing probe';
        };
        NotifyError({
          title: `Error: ${response.status} ${response.statusText}`,
          msg: change_msg
        });
      } else {
        NotifyOk({
          msg: 'Probe successfully changed',
          title: 'Changed',
          callback: () => history.push('/ui/probes')
        });
      };
    };
  };

  async function doDelete() {
    let response = await backend.deleteObject(`/api/v2/internal/probes/${name}`);
    if (!response.ok) {
      let msg = '';
      try {
        let json = await response.json();
        msg = json.detail;
      } catch(err) {
        msg = 'Error deleting probe';
      };
      NotifyError({
        title: `Error: ${response.status} ${response.statusText}`,
        msg: msg
      });
    } else {
      NotifyOk({
        msg: 'Probe successfully deleted',
        title: 'Deleted',
        callback: () => history.push('/ui/probes')
      });
    };
  };

  function onSelect(field, value) {
    let selectedProbe = probe;
    selectedProbe[field] = value;
    try {
      selectedProbe['version'] = value.split(' ')[1].slice(1, -1);
    } catch(err) {
      if (err instanceof TypeError)
        selectedProbe['version'] = '';
    };
    queryCache.setQueryData(`${querykey}_probe`, () => selectedProbe);
  };

  if (probeLoading || isTenantSchemaLoading || metricTemplateListLoading || listPackagesLoading)
    return(<LoadingAnim/>)

  else if (probeError)
    return (<ErrorComponent error={probeError.message}/>);

  else if (metricTemplateListError)
    return (<ErrorComponent error={metricTemplateListError.message}/>);

  else if (listPackagesError)
    return (<ErrorComponent error={listPackagesError}/>);

  else {
    if (!isTenantSchema) {
      let probePackage = '';
      if (!addview)
        probePackage = probe.package;

      return (
        <React.Fragment>
          <ModalAreYouSure
            isOpen={areYouSureModal}
            toggle={toggleAreYouSure}
            title={modalTitle}
            msg={modalMsg}
            onYes={modalFlag === 'submit' ? doChange : modalFlag === 'delete' ? doDelete : undefined}
          />
          <BaseArgoView
            resourcename={`${publicView ? 'Probe details' : 'probe'}`}
            location={location}
            addview={addview}
            cloneview={cloneview}
            clone={true}
            publicview={publicView}
          >
            <Formik
              initialValues = {{
                id: probe.id,
                name: probe.name,
                version: probe.version,
                package: probePackage,
                repository: probe.repository,
                docurl: probe.docurl,
                description: probe.description,
                comment: probe.comment,
                update_metrics: false
              }}
              validationSchema={ProbeSchema}
              onSubmit = {(values, actions) => onSubmitHandle(values, actions)}
            >
              {props => (
                <Form>
                  <ProbeForm
                    {...props}
                    addview={addview}
                    cloneview={cloneview}
                    publicView={publicView}
                    list_packages={listPackages}
                    onSelect={onSelect}
                    metrictemplatelist={metricTemplateList}
                    version={probe.version}
                  />
                  {
                    !publicView &&
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
              )}
            </Formik>
          </BaseArgoView>
        </React.Fragment>
      )
    } else {
      return (
        <BaseArgoView
          resourcename='Probe details'
          location={location}
          tenantview={true}
          history={true}
        >
          <Formik
            initialValues = {{
              id: probe.id,
              name: probe.name,
              version: probe.version,
              package: probe.package,
              repository: probe.repository,
              docurl: probe.docurl,
              description: probe.description,
              comment: probe.comment
            }}
            render = {props => (
              <ProbeForm
                {...props}
                isTenantSchema={true}
                publicView={publicView}
                metrictemplatelist={metricTemplateList}
                version={probe.version}
              />
            )}
          />
        </BaseArgoView>
      );
    };
  };
};


export const ProbeVersionCompare = (props) => {
  const version1 = props.match.params.id1;
  const version2 = props.match.params.id2;
  const name = props.match.params.name;
  const publicView = props.publicView;

  const [loading, setLoading] = useState(false);
  const [probe1, setProbe1] = useState({});
  const [probe2, setProbe2] = useState({});
  const [error, setError] = useState(null);

  const backend = new Backend();

  useEffect(() => {
    setLoading(true);

    async function fetchVersions() {
      try {
        let json = await backend.fetchData(`/api/v2/internal/${publicView ? 'public_' : ''}version/probe/${name}`);

        json.forEach((e) => {
          if (e.version == version1)
            setProbe1(e.fields);
          else if (e.version === version2)
            setProbe2(e.fields);
        });
      } catch(err) {
        setError(err);
      };
      setLoading(false);
    };

    fetchVersions();
  }, []);

  if (loading)
    return (<LoadingAnim/>);

  else if (error)
    return (<ErrorComponent error={error}/>);

  else if (!loading && probe1 && probe2) {
    return (
      <React.Fragment>
        <div className="d-flex align-items-center justify-content-between">
          <h2 className='ml-3 mt-1 mb-4'>{`Compare ${name}`}</h2>
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
  const name = props.match.params.name;
  const version = props.match.params.version;
  const publicView = props.publicView;

  const backend = new Backend();
  const apiUrl = `/api/v2/internal/${publicView ? 'public_' : ''}version/probe`;

  const [probe, setProbe] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    async function fetchProbeVersion() {
      try {
        let json = await backend.fetchData(`${apiUrl}/${name}`);
        json.forEach((e) => {
          if (e.version === version)
            setProbe(e.fields);
        });
      } catch(err) {
        setError(err);
      };
      setLoading(false);
    };

    fetchProbeVersion();
  }, []);

  if (loading)
    return (<LoadingAnim/>);

  else if (error)
    return (<ErrorComponent error={error}/>);

  else if (!loading && name) {
    return (
      <BaseArgoView
        resourcename={`${name} (${version})`}
        infoview={true}
      >
        <Formik
          initialValues = {{
            name: probe.name,
            version: probe.version,
            package: probe.package,
            repository: probe.repository,
            docurl: probe.docurl,
            description: probe.description,
            comment: probe.comment
          }}
          render = {props => (
            <ProbeForm
              {...props}
              version={probe.version}
              isHistory={true}
            />
          )}
        />
      </BaseArgoView>
    );
  }
  else
    return null;
};
