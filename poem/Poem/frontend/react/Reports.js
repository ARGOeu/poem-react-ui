import React, { useState } from 'react';
import { Backend, WebApi } from './DataManager';

import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  BaseArgoTable,
  BaseArgoView,
  DropDown,
  ErrorComponent,
  FancyErrorMessage,
  LoadingAnim,
  NotifyError,
  NotifyOk,
  ParagraphTitle,
  CustomReactSelect,
  CustomErrorMessage
 } from './UIElements';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Formik, Field, FieldArray, Form } from 'formik';
import {
  Button,
  FormGroup,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  InputGroup,
  InputGroupAddon,
  FormText,
  Label
} from 'reactstrap';
import * as Yup from 'yup';
import {
  fetchMetricProfiles,
  fetchOperationsProfiles,
  fetchUserDetails,
  fetchReports
} from './QueryFunctions';


const ReportsSchema = Yup.object().shape({
  name: Yup.string().required('Required'),
  groupname: Yup.string().required('Required'),
  topologyType: Yup.string().required('Required'),
  availabilityThreshold: Yup.string().required('Required'),
  reliabilityThreshold: Yup.string().required('Required'),
  downtimeThreshold: Yup.string().required('Required'),
  unknownThreshold: Yup.string().required('Required'),
  uptimeThreshold: Yup.string().required('Required'),
  metricProfile: Yup.string().required('Required'),
  aggregationProfile: Yup.string().required('Required'),
  operationsProfile: Yup.string().required('Required'),
})

export const ReportsAdd = (props) => <ReportsComponent addview={true} {...props}/>;
export const ReportsChange = (props) => <ReportsComponent {...props}/>;


const fetchReport = async (webapi, name) => {
  return await webapi.fetchReport(name);
}


const fetchAggregationProfiles = async (webapi) => {
  return await webapi.fetchAggregationProfiles();
}

const fetchThresholdsProfiles = async (webapi) => {
  return await webapi.fetchThresholdsProfiles()
}


const fetchTopologyTags = async (webapi) => {
  return await webapi.fetchReportsTopologyTags();
}


const fetchTopologyGroups = async (webapi) => {
  return await webapi.fetchReportsTopologyGroups();
}

const getCrud = (props) => {
  return props.webapireports ? props.webapireports.crud : undefined;
}

export const ReportsList = (props) => {
  const location = props.location;
  const publicView = props.publicView;

  const queryClient = useQueryClient();

  const webapi = new WebApi({
    token: props.webapitoken,
    reportsConfigurations: props.webapireports,
    metricProfiles: props.webapimetric,
    aggregationProfiles: props.webapiaggregation,
    operationsProfiles: props.webapioperations,
    thresholdsProfiles: props.webapithresholds
  });
  const crud = getCrud(props);

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    'userdetails', () => fetchUserDetails(true)
  );

  const { data: reports, error: errorReports, isLoading: loadingReports } = useQuery(
    [`${publicView ? 'public_' : ''}report`, 'backend'],  () => fetchReports(publicView),
    { enabled: !publicView ? !!userDetails : true }
  );

  const columns = React.useMemo(
    () => [
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
            to={`/ui/${publicView ? 'public_' : ''}reports/${e.name}`}
            onMouseEnter={ async () => {
              await queryClient.prefetchQuery(
                [`${publicView ? 'public_' : ''}report`, 'webapi', e.name], () => fetchReport(webapi, e.name)
              );
              await queryClient.prefetchQuery(
                [`${publicView ? 'public_' : ''}metricprofile`, 'webapi'], () => fetchMetricProfiles(webapi)
              );
              await queryClient.prefetchQuery(
                [`${publicView ? 'public_' : ''}aggregationprofile`, 'webapi'], () => fetchAggregationProfiles(webapi)
              );
              await queryClient.prefetchQuery(
                `${publicView ? 'public_' : ''}operationsprofile`, () => fetchOperationsProfiles(webapi)
              );
              await queryClient.prefetchQuery(
                [`${publicView ? 'public_' : ''}thresholdsprofile`, 'webapi'], () => fetchThresholdsProfiles(webapi)
              )
              if (crud) {
                await queryClient.prefetchQuery(
                  'topologytags', () => fetchTopologyTags(webapi)
                );
                await queryClient.prefetchQuery(
                  'topologygroups', () => fetchTopologyGroups(webapi)
                );
              }
            } }
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
    ], []
  );

  if (loadingReports || loadingUserDetails)
    return (<LoadingAnim/>);

  else if (errorReports)
    return (<ErrorComponent error={errorReports}/>);

  else if (errorUserDetails)
    return (<ErrorComponent error={errorUserDetails} />)

  else if (!loadingUserDetails && reports) {
    return (
      <BaseArgoView
        resourcename='report'
        location={location}
        listview={true}
        addnew={!publicView}
        addperm={publicView ? false : userDetails.is_superuser || userDetails.groups.reports.length > 0}
      >
        <BaseArgoTable
          data={reports}
          columns={columns}
          resourcename='reports'
          page_size={10}
        />
      </BaseArgoView>
    )
  }
  else
    return null
};


function insertSelectPlaceholder(data, text) {
  if (data)
    return [text, ...data]
  else
    return [text]
}


function preProcessTagValue(data) {
  if (data === '1')
    return 'yes'
  else if (data === '0')
    return 'no'

  return data
}


const TagSelect = ({field, tagOptions, onChangeHandler, isMulti,
  closeMenuOnSelect, tagInitials}) => {
  if (tagInitials) {
    return (
      <CustomReactSelect
        name={field.name}
        closeMenuOnSelect={closeMenuOnSelect}
        isMulti={isMulti}
        isClearable={false}
        onChange={(e) => onChangeHandler(e)}
        options={tagOptions}
        value={tagInitials}
      />
    )
  }
  else
    return (
      <CustomReactSelect
        name={field.name}
        closeMenuOnSelect={closeMenuOnSelect}
        isMulti={isMulti}
        isClearable={false}
        onChange={(e) => onChangeHandler(e)}
        options={tagOptions}
      />
    )
}


const TopologyTagList = ({ part, fieldName, tagsState, setTagsState, tagsAll, addview, push, form, remove }) => {
  const extractTags = (which, filter=false) => {
    let selected = new Array()

    if (filter)
      if (tagsState[part])
        Object.keys(tagsState[part]).forEach((e) =>
          selected.push(tagsState[part][e])
        )

    let found = tagsAll.filter(element => element.name === which)
    found = found[0].values

    if (filter)
      found = found.filter(element => selected.indexOf(element.name) === -1)

    return found
  }

  const recordSelectedTagKeys = (index, value) => {
    let newState = JSON.parse(JSON.stringify(tagsState))
    if (newState[part])
      newState[part][index] = value
    else {
      newState[part] = new Object()
      newState[part][index] = value
    }
    setTagsState(newState)
  }

  const isMultiValuesTags = (data) => {
    if (data.length === 2 || data.length === 1) {
      if (data[0].value === 'yes' ||
        data[0].value === 'no')
      return false
    }
    else
      return true
  }

  const tagsInitValues = (key, data, preprocess=false) => {
    if (data[key] === '')
      return undefined
    if (data[key].indexOf(' ') === -1)
      return new Object({
        'label': preprocess ? preProcessTagValue(data[key]) : data[key],
        'value': preprocess ? preProcessTagValue(data[key]) : data[key]
      })
    else {
      let tmp = data[key].split(' ').map(e => new Object({
        'label': preprocess ? preProcessTagValue(e) : e,
        'value': preprocess ? preProcessTagValue(e) : e
      }))
      return tmp
    }
  }

  const extractValuesTags = (index, preprocess=false) => {
    if (tagsState[part] !== undefined) {
      let interestTags = extractTags(part)
      interestTags = interestTags.filter((e) => e.name === tagsState[part][index])
      if (interestTags.length > 0) {
        interestTags = interestTags[0].values.map((e) => new Object({
          'label': preprocess ? preProcessTagValue(e) : e,
          'value': preprocess ? preProcessTagValue(e) : e
        }))
        return interestTags
      }
    }
    return []
  }

  return (
    <React.Fragment>
      {
        form.values[fieldName].map((tags, index) => (
          <React.Fragment key={index}>
            <Row key={index} className="no-gutters">
              <Col md={4}>
                <Field
                  name={`${fieldName}.${index}.name`}
                  data-testid={`${fieldName}.${index}.name`}
                  component={TagSelect}
                  tagOptions={extractTags(part, true).map((e) => new Object({
                    'label': e.name,
                    'value': e.name
                  }))}
                  onChangeHandler={(e) => {
                    form.setFieldValue(`${fieldName}.${index}.name`, e.value)
                    recordSelectedTagKeys(index, e.value)
                  }}
                  isMulti={false}
                  closeMenuOnSelect={true}
                  tagInitials={!addview ? tagsInitValues('name', tags) : undefined}
                />
              </Col>
              <Col md={7}>
                <Field
                  name={`${fieldName}.${index}.value`}
                  data-testid={`${fieldName}.${index}.value`}
                  component={TagSelect}
                  tagOptions={extractValuesTags(index, true)}
                  onChangeHandler={(e) => {
                    if (Array.isArray(e)) {
                      let joinedValues = ''
                      e.forEach((e) => {
                        joinedValues += e.value + ' '
                      })
                      form.setFieldValue(`${fieldName}.${index}.value`, joinedValues.trim())
                    }
                    else
                      form.setFieldValue(`${fieldName}.${index}.value`, e.value.trim())
                  }}
                  isMulti={isMultiValuesTags(extractValuesTags(index))}
                  closeMenuOnSelect={!isMultiValuesTags(extractValuesTags(index))}
                  tagInitials={!addview ? tagsInitValues('value', tags, true) : undefined}
                />
              </Col>
              <Col md={1} className="pl-2 pt-1">
                <Button size="sm" color="danger"
                  type="button"
                  data-testid={`remove${fieldName.toLowerCase().endsWith('tags') ? 'Tag' : 'Extension'}-${index}`}
                  onClick={() => {
                    let newState = JSON.parse(JSON.stringify(tagsState))
                    let renumNewState = JSON.parse(JSON.stringify(tagsState))

                    delete newState[part][index]
                    delete renumNewState[part]
                    renumNewState[part] = new Object()

                    let i = 0
                    for (var tag in newState[part]) {
                      renumNewState[part][i] = newState[part][tag]
                      i += 1
                    }

                    remove(index)
                    setTagsState(renumNewState)
                  }}>
                  <FontAwesomeIcon icon={faTimes}/>
                </Button>
              </Col>
            </Row>
          </React.Fragment>
        ))
      }
      <Row>
        <Col className="pt-4 d-flex justify-content-center">
          <Button color="success"
            type="button"
            onClick={() => {push({'name': '', 'value': ''})}}>
            {`Add new ${fieldName.toLowerCase().endsWith('tags') ? 'tag' : 'extension'}`}
          </Button>
        </Col>
      </Row>
    </React.Fragment>
  )
}


const EntitySelect = ({field, entitiesOptions, onChangeHandler, entitiesInitials}) => {
  if (entitiesInitials) {
    return (
      <CustomReactSelect
        name={field.name}
        closeMenuOnSelect={false}
        placeholder="Search..."
        isClearable={false}
        isMulti
        onChange={(e) => onChangeHandler(e)}
        options={entitiesOptions}
        value={entitiesInitials}
      />
    )
  }
  else
    return (
      <CustomReactSelect
        name={field.name}
        closeMenuOnSelect={false}
        placeholder="Search..."
        isClearable={false}
        isMulti
        onChange={(e) => onChangeHandler(e)}
        options={entitiesOptions}
      />
    )
}


const TopologyEntityFields = ({topoGroups, addview, form}) => {
  const entityInitValues = (matchWhat) => {
    let tmp = new Array()
    for (let entity of form.values.entities) {
      if (matchWhat.indexOf(entity.name) > -1) {
        if (entity.value.indexOf(' ') > -1) {
          tmp = entity.value.split(' ').map(e => new Object({
            'label': e,
            'value': e
          }))
        }
        else
          tmp.push(
            new Object({
              'label': entity.value,
              'value': entity.value
            }))
      }
    }
    return tmp
  }

  const formatSelectEntities = (data) => {
    let formatted = new Array()
    for (var e of [...data])
      formatted.push(new Object({
        'label': e,
        'value': e
      }))
    return formatted
  }

  let topoType = form.values.topologyType
  let label1 = undefined
  let label2 = undefined
  let key1 = undefined
  let key2 = undefined

  if (topoType === 'Sites') {
    label1 = 'NGIs:'
    label2 = 'Sites:'
    key1 = 'ngis'
    key2 = 'sites'
  }
  else if (topoType === 'ServiceGroups'){
    label1 = 'Projects:'
    label2 = 'Service groups:'
    key1 = 'projects'
    key2 = 'servicegroups'
  }
  else {
    label1 = 'Upper group:'
    label2 = 'Lower group:'
    key1 = 'ngis'
    key2 = 'sites'
  }

  return (
    <React.Fragment>
      <Label to='topoEntity1'>
        {label1}
      </Label>
      <Field
        name="entities.0.value"
        id="topoEntity1"
        component={EntitySelect}
        entitiesOptions={formatSelectEntities(topoGroups[key1])}
        onChangeHandler={(e) => {
          let joinedValues = ''
          for (let event of e)
            joinedValues += event.value + ' '
          joinedValues = joinedValues.trim()
          form.setFieldValue("entities.0.value", joinedValues)
          form.setFieldValue("entities.0.name", key1.toUpperCase().slice(0, -1))
        }}
        entitiesInitials={!addview ? entityInitValues(["NGI", "PROJECT"]) : undefined}
      />
      <Label to='topoEntity2' className="pt-2">
        {label2}
      </Label>
      <Field
        name="entities.1.value"
        id="topoEntity2"
        component={EntitySelect}
        entitiesOptions={formatSelectEntities(topoGroups[key2])}
        onChangeHandler={(e) => {
          let joinedValues = ''
          for (let event of e)
            joinedValues += event.value + ' '
          joinedValues = joinedValues.trim()
          form.setFieldValue("entities.1.name", key2.toUpperCase())
          form.setFieldValue("entities.1.value", joinedValues)
        }}
        entitiesInitials={!addview ? entityInitValues(["SITES", "SERVICEGROUPS"]) : undefined}
      />
    </React.Fragment>
  )
}


const ProfileSelect = ({ field, label, options, onChangeHandler, initVal }) => {
  let value = null
  if (initVal)
    value = { value: initVal, label: initVal }

  return (
    <CustomReactSelect
      name={ field.name }
      label={ label }
      closeMenuOnSelect={ true }
      isClearable={ field.name === 'thresholdsProfile' }
      onChange={ e => onChangeHandler(e) }
      options={ options }
      value={ value }
    />
  )
}


export const ReportsComponent = (props) => {
  const report_name = props.match.params.name;
  const addview = props.addview
  const location = props.location;
  const history = props.history;

  const backend = new Backend();
  const queryClient = useQueryClient();
  const crud = getCrud(props);

  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalMsg, setModalMsg] = useState(undefined);
  const [modalTitle, setModalTitle] = useState(undefined);
  const [onYes, setOnYes] = useState('')
  const [formikValues, setFormikValues] = useState({})
  const topologyTypes = ['Sites', 'ServiceGroups']

  const [tagsState, setTagsState] = useState(new Object({
    'groups': undefined,
    'endpoints': undefined
  }))
  const [groupsTags, setGroupsTags] = useState(new Array())
  const [endpointsTags, setEndpointsTags] = useState(new Array())
  const [entitiesState, setEntitiesState] = useState(new Array())
  const [groupsExtensions, setGroupsExtensions] = useState(new Array())
  const [endpointsExtensions, setEndpointsExtensions] = useState(new Array())
  const [extensionsState, setExtensionsState] = useState(
    new Object({
      groups: undefined,
      endpoints: undefined
    })
  )

  const webapi = new WebApi({
    token: props.webapitoken,
    reportsConfigurations: props.webapireports,
    metricProfiles: props.webapimetric,
    aggregationProfiles: props.webapiaggregation,
    operationsProfiles: props.webapioperations,
    thresholdsProfiles: props.webapithresholds
  });

  const webapiAddMutation = useMutation(async (values) => await webapi.addReport(values));
  const backendAddMutation = useMutation(async (values) => await backend.addObject('/api/v2/internal/reports/', values));
  const webapiChangeMutation = useMutation(async (values) => await webapi.changeReport(values));
  const backendChangeMutation = useMutation(async (values) => await backend.changeObject('/api/v2/internal/reports/', values));
  const webapiDeleteMutation = useMutation(async (idReport) => await webapi.deleteReport(idReport));
  const backendDeleteMutation = useMutation(async (idReport) => await backend.deleteObject(`/api/v2/internal/reports/${idReport}`));

  const { data: userDetails, error: errorUserDetails, isLoading: loadingUserDetails } = useQuery(
    'userdetails', () => fetchUserDetails(true)
  );

  const { data: backendReport, error: errorBackendReport, isLoading: loadingBackendReport } = useQuery(
    ['report', 'backend', report_name], async () => {
      return await backend.fetchData(`/api/v2/internal/reports/${report_name}`)
    },
    {
      enabled: !!userDetails && !addview,
      initialData: () => {
        return queryClient.getQueryData(['reports', 'backend'])?.find(rep => rep.name === report_name)
      }
    }
  )

  const { data: webApiReport, error: errorWebApiReport, isLoading: loadingWebApiReport } = useQuery(
    ['report', 'webapi', report_name], () => fetchReport(webapi, report_name),
    {
      enabled: !!userDetails && !addview,
      onSuccess: (data) => {
        let [groupstags, groupexts] = formatFromReportTags([
          'argo.group.filter.tags', 'argo.group.filter.tags.array'],
          data['filter_tags'])
        let [endpointstags, endpointexts] = formatFromReportTags([
          'argo.endpoint.filter.tags', 'argo.endpoint.filter.tags.array'],
          data['filter_tags'])
        let entities = formatFromReportEntities('argo.group.filter.fields', data['filter_tags'])
        let preselectedtags = JSON.parse(JSON.stringify(tagsState))
        let preselectedexts = JSON.parse(JSON.stringify(extensionsState))
        preselectedtags['groups'] = new Object()
        preselectedtags['endpoints'] = new Object()
        preselectedexts['groups'] = new Object()
        preselectedexts['endpoints'] = new Object()
        groupstags.forEach((e, i) => {
          preselectedtags['groups'][i] = e.name
        })
        endpointstags.forEach((e, i) => {
          preselectedtags['endpoints'][i] = e.name
        })
        groupexts.forEach((e, i) => {
          preselectedexts['groups'][i] = e.name
        })
        endpointexts.forEach((e, i) => {
          preselectedexts['endpoints'][i] = e.name
        })
        if (tagsState['groups'] === undefined
          && tagsState['endpoints'] === undefined)
          setTagsState(preselectedtags)
        if (
          extensionsState['groups'] === undefined &&
          extensionsState['endpoints'] == undefined
        )
          setExtensionsState(preselectedexts)
        setGroupsTags(groupstags)
        setEndpointsTags(endpointstags)
        setEntitiesState(entities)
        setGroupsExtensions(groupexts)
        setEndpointsExtensions(endpointexts)
      }
    }
  )

  const { data: listMetricProfiles, error: listMetricProfilesError, isLoading: listMetricProfilesLoading } = useQuery(
    ['metricprofile', 'webapi'],  () => fetchMetricProfiles(webapi),
    { enabled: !!userDetails }
  );

  const { data: listAggregationProfiles, error: listAggregationProfilesError, isLoading: listAggregationProfilesLoading } = useQuery(
    ['aggregationprofile', 'webapi'], () => fetchAggregationProfiles(webapi),
    { enabled: !!userDetails }
  );

  const { data: listOperationsProfiles, error: listOperationsProfilesError, isLoading: listOperationsProfilesLoading } = useQuery(
    'operationsprofile', () => fetchOperationsProfiles(webapi),
    { enabled: !!userDetails }
  );

  const { data: listThresholdsProfiles, error: listThresholdsProfilesError, isLoading: listThresholdsProfilesLoading } = useQuery(
    ['thresholdsprofile', 'webapi'], () => fetchThresholdsProfiles(webapi),
    { enabled: !!userDetails }
  )

  const { data: topologyTags, error: topologyTagsError, isLoading: loadingTopologyTags } = useQuery(
    'topologytags', () => fetchTopologyTags(webapi),
    { enabled: !!userDetails && crud }
  );

  const { data: topologyGroups, error: topologyGroupsErrors, isLoading: loadingTopologyGroups } = useQuery(
    'topologygroups', () => fetchTopologyGroups(webapi),
    { enabled: !!userDetails && crud }
  );

  const sortStr = (a, b) => {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    if (a.toLowerCase() > b.toLowerCase()) return 1;
    if (a.toLowerCase() === b.toLowerCase()) {
      if (a.toLowerCase() < b.toLowerCase()) return -1;
      if (a.toLowerCase() > b.toLowerCase()) return 1;
      if (a.toLowerCase() === b.toLowerCase()) return 0;
    }
  }

  const extractProfileNames = (profiles) => {
    let tmp = new Array();

    for (let profile of profiles)
      tmp.push(profile.name)

    tmp = tmp.sort(sortStr)

    return tmp;
  }

  const whichTopologyType = (schema) => {
    if (!addview) {
      if (schema.group.group.type.toLowerCase() === topologyTypes[0].toLowerCase())
        return topologyTypes[0]
      else
        return topologyTypes[1]
    }
    else
      return ''
  }

  const onSubmitHandle = async (formValues) => {
    let msg = undefined;
    let title = undefined;

    if (addview) {
      msg = 'Are you sure you want to add Report?'
      title = 'Add report'
    }
    else {
      msg = 'Are you sure you want to change Report?'
      title = 'Change report'
    }
    setAreYouSureModal(!areYouSureModal);
    setModalMsg(msg)
    setModalTitle(title)
    setOnYes('change')
    setFormikValues(formValues)
  }

  const formatToReportTags = (tagsContext, formikTags, formikExtensions) => {
    const formatTag = (tag, prefix='') => {
      let tmpTag = new Object()
      if (tag.value.indexOf(' ') !== -1) {
        if (tag.value.indexOf(',') !== -1)
          tag.value = tag.value.replace(',', '')
        let values = tag.value.replace(/ /g, ', ')
        tmpTag = new Object({
          name: `${prefix}${tag.name}`,
          value: values,
          context: tagsContext.replace(".filter.tags", ".filter.tags.array")
        })
      }
      else if (tag.value.indexOf(' ') === -1
        && tag.value.toLowerCase() !== 'yes'
        && tag.value.toLowerCase() !== 'no'
        && tag.value.toLowerCase() !== '1'
        && tag.value.toLowerCase() !== '0') {
        tmpTag['name'] = `${prefix}${tag.name}`
        tmpTag['value'] = tag.value
        tmpTag['context'] = tagsContext.replace(".filter.tags", ".filter.tags.array")
      }
      else {
        let tmpTagValue = tag.value
        if (tag.value.toLowerCase() === 'yes')
          tmpTagValue = '1'
        else if (tag.value === 'no')
          tmpTagValue = '0'
        tmpTag['name'] = `${prefix}${tag.name}`
        tmpTag['value'] = tmpTagValue
        tmpTag['context'] = tagsContext
      }
      return tmpTag
    }

    let tags = new Array()

    for (let tag of formikTags) {
      tags.push(formatTag(tag))
    }

    for (let tag of formikExtensions)
      tags.push(formatTag(tag, 'info_ext_'))

    return tags
  }

  const formatToReportEntities = (context, formikEntities) => {
    let entities = new Array()

    for (let entity of formikEntities) {
      let tmpEntity = new Object()
      let tmpEntites = new Array()
      if (entity.value.indexOf(' ') !== -1) {
        let values = entity.value.split(' ')
        for (var val of values)
          tmpEntites.push(new Object({
            name: entity.name,
            value: val,
            context: context
          }))
        entities = [...entities, ...tmpEntites]
      }
      else {
        tmpEntity['name'] = entity.name
        tmpEntity['value'] = entity.value
        tmpEntity['context'] = context
        entities.push(tmpEntity)
      }
    }
    return entities
  }

  const formatFromReportTags = (tagsContext, formikTags) => {
    let tmpTagsJoint = new Object()
    let tags = new Array()
    let extensions = new Array()

    for (let tag of formikTags) {
      for (let tagContext of tagsContext) {
        if (tag.context === tagContext) {
          if (tmpTagsJoint[tag.name] === undefined)
            tmpTagsJoint[tag.name] = new Array()
          tmpTagsJoint[tag.name].push(tag.value)
        }
      }
    }

    for (let tag in tmpTagsJoint) {
      if (tag.startsWith('info_ext_'))
        extensions.push(
          new Object({
            name: tag.substring(9),
            value: tmpTagsJoint[tag].join(' ').trim().replace(/,/g, '')
          })
        )
      else
        tags.push(new Object({
          'name': tag,
          'value': tmpTagsJoint[tag].join(' ').trim().replace(/,/g, '')
        }))
    }

    return [tags, extensions]
  }

  const formatFromReportEntities = (context, formikEntities) => {
    let tmpEntityJoint = new Object()
    let entities = new Array()

    for (let entity of formikEntities) {
      if (entity.context === context) {
        if (tmpEntityJoint[entity.name] === undefined)
          tmpEntityJoint[entity.name] = new Array()
        tmpEntityJoint[entity.name].push(entity.value)
      }
    }

    for (let entity in tmpEntityJoint)
      entities.push(new Object({
        'name': entity,
        'value': tmpEntityJoint[entity].join(' ')
      }))

    return entities
  }

  const formatTopologySchema = (toposchema) => {
    let tmpTopoSchema = new Object()
    if (toposchema.toLowerCase() === 'ServiceGroups'.toLowerCase()) {
      tmpTopoSchema = {
        'group': {
          'type': 'PROJECT',
          'group': {
            'type': 'SERVICEGROUPS'
          }
        }
      }
      return tmpTopoSchema
    }
    else if (toposchema.toLowerCase() === 'Sites'.toLowerCase()) {
      tmpTopoSchema = {
        'group': {
          'type': 'NGI',
          'group': {
            'type': 'SITES'
          }
        }
      }
      return tmpTopoSchema
    }
  }

  const extractProfileMetadata = (profiletype, name) => {
    let profile = undefined
    if (profiletype === 'metric') {
      profile = listMetricProfiles.filter(
        profile => profile.name === name
      )
      profile = profile[0]
    }

    if (profiletype === 'aggregation') {
      profile = listAggregationProfiles.filter(
        profile => profile.name === name
      )
      profile = profile[0]
    }

    if (profiletype === 'operations') {
      profile = listOperationsProfiles.filter(
        profile => profile.name === name
      )
      profile = profile[0]
    }

    if (profiletype === 'thresholds') {
      profile = listThresholdsProfiles.filter(
        profile => profile.name === name
      )
      profile = profile[0]
    }

    if (profile) {
      return new Object({
        id: profile.id,
        name: profile.name,
        type: profiletype
      })
    }
    else
      new Object({})
  }

  const doDelete = (idReport) => {
    webapiDeleteMutation.mutate(idReport, {
      onSuccess: () => {
        backendDeleteMutation.mutate(idReport, {
          onSuccess: () => {
            queryClient.invalidateQueries('report');
            NotifyOk({
              msg: 'Report successfully deleted',
              title: 'Deleted',
              callback: () => history.push('/ui/reports')
            });
          },
          onError: (error) => {
            NotifyError({
              title: 'Internal API error',
              msg: error.message ? error.message : 'Internal API error deleting report'
            })
          }
        })
      },
      onError: (error) => {
        NotifyError({
          title: 'Web API error',
          msg: error.message ? error.message : 'Web API error deleting report'
        })
      }
    })
  }

  const doChange = (formValues) => {
    let dataToSend = new Object()
    dataToSend.info = {
      name: formValues.name,
      description: formValues.description,
      //TODO: created, updated
    }
    dataToSend.thresholds = {
      availability: Number.parseFloat(formValues.availabilityThreshold),
      reliability: Number.parseFloat(formValues.reliabilityThreshold),
      uptime: Number.parseFloat(formValues.uptimeThreshold),
      unknown: Number.parseFloat(formValues.unknownThreshold),
      downtime: Number.parseFloat(formValues.downtimeThreshold)
    }
    dataToSend.disabled = formValues.disabled
    let extractedMetricProfile = extractProfileMetadata('metric',
      formValues.metricProfile)
    let extractedAggregationProfile = extractProfileMetadata('aggregation',
      formValues.aggregationProfile)
    let extractedOperationProfile = extractProfileMetadata('operations',
      formValues.operationsProfile)
    let extractedThresholdsProfile = extractProfileMetadata(
      'thresholds', formValues.thresholdsProfile
    )
    dataToSend.profiles = new Array()
    dataToSend['profiles'].push(extractedMetricProfile)
    dataToSend['profiles'].push(extractedAggregationProfile)
    dataToSend['profiles'].push(extractedOperationProfile)
    if (extractedThresholdsProfile)
      dataToSend['profiles'].push(extractedThresholdsProfile)
    let groupTagsFormatted = formatToReportTags('argo.group.filter.tags', formValues.groupsTags, formikValues.groupsExtensions)
    let endpointTagsFormatted = formatToReportTags('argo.endpoint.filter.tags', formValues.endpointsTags, formikValues.endpointsExtensions)
    let groupEntitiesFormatted = formatToReportEntities('argo.group.filter.fields', formValues.entities)
    dataToSend['filter_tags'] = [...groupTagsFormatted,
      ...endpointTagsFormatted, ...groupEntitiesFormatted]
    dataToSend['topology_schema'] = formatTopologySchema(formValues.topologyType)

    if (addview) {
      webapiAddMutation.mutate(dataToSend, {
        onSuccess: (data) => {
          backendAddMutation.mutate({
            apiid: data.data.id,
            name: dataToSend.info.name,
            groupname: formValues.groupname,
            description: formValues.description,
          }, {
            onSuccess: () => {
              queryClient.invalidateQueries('report');
              NotifyOk({
                msg: 'Report successfully added',
                title: 'Added',
                callback: () => history.push('/ui/reports')
              });
            },
            onError: (error) => {
              NotifyError({
                title: 'Internal API error',
                msg: error.message ? error.message : 'Internal API error adding report'
              })
            }
          })
        },
        onError: (error) => {
          NotifyError({
            title: 'Web API error',
            msg: error.message ? error.message : 'Web API error adding report'
          })
        }
      })
    }
    else {
      dataToSend.id = webApiReport.id
      webapiChangeMutation.mutate(dataToSend, {
        onSuccess: () => {
          backendChangeMutation.mutate({
            apiid: dataToSend.id,
            name: dataToSend.info.name,
            groupname: formValues.groupname,
            description: formValues.description,
          }, {
            onSuccess: () => {
              queryClient.invalidateQueries('report');
              NotifyOk({
                msg: 'Report successfully changed',
                title: 'Changed',
                callback: () => history.push('/ui/reports')
              });
            },
            onError: (error) => NotifyError({
              title: 'Internal API error',
              msg: error.message ? error.message : 'Internal API error changing report'
            })
          })
        },
        onError: (error) => {
          NotifyError({
            title: 'Web API error',
            msg: error.message ? error.message : 'Web API error changing report'
          })
        }
      })
    }
  }

  const onYesCallback = () => {
    if (onYes === 'delete')
      doDelete(formikValues.id)
    else if (onYes === 'change')
      doChange(formikValues)
  }

  if (loadingUserDetails || loadingBackendReport || loadingWebApiReport || listMetricProfilesLoading || listAggregationProfilesLoading || listOperationsProfilesLoading || listThresholdsProfilesLoading || loadingTopologyTags || loadingTopologyGroups)
    return (<LoadingAnim/>);

  else if (errorUserDetails)
    return (<ErrorComponent error={errorUserDetails}/>);

  else if (errorBackendReport)
    return (<ErrorComponent error={errorBackendReport} />)

  else if (errorWebApiReport)
    return (<ErrorComponent error={errorWebApiReport} />)

  else if (listMetricProfilesError)
    return (<ErrorComponent error={listMetricProfilesError}/>);

  else if (listAggregationProfilesError)
    return (<ErrorComponent error={listAggregationProfilesError}/>);

  else if (listOperationsProfilesError)
    return (<ErrorComponent error={listOperationsProfilesError}/>);

  else if (listThresholdsProfilesError)
    return (<ErrorComponent error={listThresholdsProfilesError} />)

  else if (topologyTagsError)
    return (<ErrorComponent error={topologyTagsError} />)

  else if (topologyGroupsErrors)
    return (<ErrorComponent error={topologyGroupsErrors} />)

  else if (userDetails && listMetricProfiles && listAggregationProfiles && listThresholdsProfiles && listOperationsProfiles) {
    let metricProfile = '';
    let aggregationProfile = '';
    let operationsProfile = '';
    let thresholdsProfile = '';

    if (webApiReport) {
      webApiReport.profiles.forEach(profile => {
        if (profile.type === 'metric')
          metricProfile = profile.name;

        if (profile.type === 'aggregation')
          aggregationProfile = profile.name;

        if (profile.type === 'operations')
          operationsProfile = profile.name;

        if (profile.type == 'thresholds')
          thresholdsProfile = profile.name;
      })
    }

    let write_perm = undefined;
    let grouplist = undefined;
    if (!addview) {
      write_perm = userDetails.is_superuser ||
            userDetails.groups.reports.indexOf(backendReport.groupname) >= 0;
    }
    else {
      write_perm = userDetails.is_superuser ||
        userDetails.groups.reports.length > 0;
    }
    if (write_perm)
      grouplist = userDetails.groups.reports
    else
      grouplist = [backendReport.groupname]

    var allTags = new Array()
    var allExtensions = new Array()

    if (topologyTags) {
      for (let entity of topologyTags) {
        let tmpTags = new Array()
        let tmpExtensions = new Array()
        for (let item of entity['values']) {
          if (item['name'].startsWith('info_ext_'))
            tmpExtensions.push(
              new Object({
                name: item['name'].substring(9),
                values: item['values']
              })
            )

          else
            tmpTags.push(item)
        }
        allTags.push(
          new Object({
            name: entity['name'],
            values: tmpTags
          })
        )
        allExtensions.push(
          new Object({
            name: entity['name'],
            values: tmpExtensions
          })
        )
      }
    }

    let ngis = new Set()
    let sites = new Set()
    let projects = new Set()
    let servicegroups = new Set()

    if (topologyGroups) {
      for (var entity of topologyGroups) {
        if (entity['type'].toLowerCase() === 'project') {
          projects.add(entity['group'])
          servicegroups.add(entity['subgroup'])
        }

        else if (entity['type'].toLowerCase() === 'ngi') {
          ngis.add(entity['group'])
          sites.add(entity['subgroup'])
        }
      }
    }

    const topoGroups = new Object({
      'ngis': Array.from(ngis).sort(sortStr),
      'sites': Array.from(sites).sort(sortStr),
      'projects': Array.from(projects).sort(sortStr),
      'servicegroups': Array.from(servicegroups).sort(sortStr)
    })


    return (
      <BaseArgoView
        resourcename='report'
        location={location}
        modal={true}
        state={{areYouSureModal, 'modalFunc': onYesCallback, modalTitle, modalMsg}}
        toggle={() => setAreYouSureModal(!areYouSureModal)}
        submitperm={write_perm}
        addview={addview}
        history={false}
      >
        <Formik
          validationSchema={ReportsSchema}
          initialValues = {{
            id: webApiReport ? webApiReport.id : '',
            disabled: webApiReport ? webApiReport.disabled : false,
            name: webApiReport ? webApiReport.info.name : '',
            description: webApiReport ? webApiReport.info.description : '',
            metricProfile: metricProfile,
            aggregationProfile: aggregationProfile,
            operationsProfile: operationsProfile,
            thresholdsProfile: thresholdsProfile,
            availabilityThreshold: webApiReport ? webApiReport.thresholds.availability : '',
            reliabilityThreshold: webApiReport ? webApiReport.thresholds.reliability : '',
            uptimeThreshold: webApiReport ? webApiReport.thresholds.uptime : '',
            unknownThreshold: webApiReport ? webApiReport.thresholds.unknown : '',
            downtimeThreshold: webApiReport ? webApiReport.thresholds.downtime : '',
            topologyType: whichTopologyType(webApiReport ? webApiReport.topology_schema : {}),
            groupname: backendReport ? backendReport.groupname : '',
            groupsTags: groupsTags,
            endpointsTags: endpointsTags,
            groupsExtensions: groupsExtensions,
            endpointsExtensions: endpointsExtensions,
            entities: entitiesState
          }}
          enableReinitialize={true}
          onSubmit = {(values) => onSubmitHandle(values)}
        >
          {(props) => (
            <Form>
              <FormGroup>
                <Row className='align-items-center'>
                  <Col md={6}>
                    <InputGroup>
                      <InputGroupAddon addonType='prepend'>Name</InputGroupAddon>
                      <Field
                        type='text'
                        name='name'
                        data-testid='name'
                        className='form-control form-control-lg'
                      />
                    </InputGroup>
                    {
                      props.errors && props.errors.name &&
                        FancyErrorMessage(props.errors.name)
                    }
                    <FormText color='muted'>
                      Report name
                    </FormText>
                  </Col>
                  <Col md={2}>
                    <label>
                      <Field
                        type='checkbox'
                        name='disabled'
                        className='mr-1'
                      />
                      Disabled
                    </label>
                    <FormText color='muted'>
                      Mark report as disabled.
                    </FormText>
                  </Col>
                </Row>
                <Row className='mt-3'>
                  <Col md={10}>
                    <Label for='description'>Description:</Label>
                    <Field
                      id='description'
                      className='form-control'
                      component='textarea'
                      rows={4}
                      name='description'
                    />
                    <FormText color='muted'>
                      Free text report description.
                    </FormText>
                  </Col>
                </Row>
                <Row className='mt-4'>
                  <Col md={3}>
                    <InputGroup>
                      <InputGroupAddon addonType='prepend'>Group</InputGroupAddon>
                      <Field
                        name='groupname'
                        data-testid='groupname'
                        component='select'
                        className={`form-control custom-select`}
                      >
                        <option key={0} value='' hidden color='text-muted'>Select group</option>
                        {
                          grouplist.map((group, i) =>
                            <option key={i + 1} value={group}>{group}</option>
                          )
                        }
                      </Field>
                    </InputGroup>
                    {
                      props.errors && props.errors.groupname &&
                        FancyErrorMessage(props.errors.groupname)
                    }
                    <FormText color='muted'>
                      Report is member of given group
                    </FormText>
                  </Col>
                </Row>
              </FormGroup>
              <FormGroup className='mt-4'>
                <ParagraphTitle title='Profiles'/>
                <Row className='mt-2'>
                  <Col md={4}>
                    <Field
                      id='metricProfile'
                      name='metricProfile'
                      component={ProfileSelect}
                      options={
                        extractProfileNames(listMetricProfiles).map((profile) => new Object({
                          label: profile, value: profile
                        }))
                      }
                      onChangeHandler={(e) => props.setFieldValue('metricProfile', e.value)}
                      label='Metric profile:'
                      initVal={ !addview ? props.values.metricProfile : null }
                      required={true}
                    />
                    <CustomErrorMessage name='metricProfile' />
                  </Col>
                  <Col md={4}>
                    <Field
                      id='aggregationProfile'
                      name='aggregationProfile'
                      component={ProfileSelect}
                      options={
                        extractProfileNames(listAggregationProfiles).map((profile) => new Object({
                          label: profile, value: profile
                        }))
                      }
                      onChangeHandler={ (e) => props.setFieldValue('aggregationProfile', e.value) }
                      label='Aggregation profile:'
                      initVal={ !addview ? props.values.aggregationProfile : null }
                      required={true}
                    />
                    <CustomErrorMessage name='aggregationProfile' />
                  </Col>
                  <Col md={4}>
                    <Field
                      name='operationsProfile'
                      id='operationsProfile'
                      component={ProfileSelect}
                      options={
                        extractProfileNames(listOperationsProfiles).map((profile) => new Object({
                          label: profile, value: profile
                        }))
                      }
                      onChangeHandler={ (e) =>
                        props.setFieldValue('operationsProfile', e.value)
                      }
                      label='Operations profile:'
                      initVal={ !addview ? props.values.operationsProfile : null }
                      required={true}
                    />
                    <CustomErrorMessage name='operationsProfile' />
                  </Col>
                </Row>
                <Row className='mt-4'>
                  <Col md={4}>
                    <Field
                      name='thresholdsProfile'
                      id='thresholdsProfile'
                      component={ProfileSelect}
                      options={
                        extractProfileNames(listThresholdsProfiles).map((profile) => new Object({
                          label: profile, value: profile
                        }))
                      }
                      onChangeHandler={ (e) => {
                        if (e)
                          props.setFieldValue('thresholdsProfile', e.value)
                        else
                          props.setFieldValue('thresholdsProfile', null)
                      }}
                      label='Thresholds profile:'
                      initVal={ !addview ? props.values.thresholdsProfile : null }
                    />
                    <CustomErrorMessage name='thresholdsProfile' />
                  </Col>
                </Row>
              </FormGroup>
              {
                (crud) &&
                <FormGroup className='mt-4'>
                  <ParagraphTitle title='Topology configuration'/>
                  <Row>
                    <Col md={2}>
                      <Label for='topologyType'>Topology type:</Label>
                      <Field
                        id='topologyType'
                        name='topologyType'
                        component={DropDown}
                        data={insertSelectPlaceholder(topologyTypes, 'Select')}
                        required={true}
                        class_name='custom-select'
                      />
                      {
                        props.errors && props.errors.topologyType &&
                          FancyErrorMessage(props.errors.topologyType)
                      }
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Card className="mt-3" data-testid="card-group-of-groups">
                        <CardHeader>
                          <strong>Group of groups</strong>
                        </CardHeader>
                        <CardBody>
                          <CardTitle className="mb-2">
                            <strong>Tags</strong>
                          </CardTitle>
                          <FieldArray
                            name="groupsTags"
                            render={props => (
                              <TopologyTagList
                                part="groups"
                                fieldName="groupsTags"
                                tagsState={tagsState}
                                setTagsState={setTagsState}
                                tagsAll={allTags}
                                {...props}/>
                            )}
                          />
                          <div>
                            <hr style={{'borderTop': '1px solid #b5c4d1'}}/>
                          </div>
                          <CardTitle className="mb-2">
                            <strong>Extensions</strong>
                          </CardTitle>
                          <FieldArray
                            name="groupsExtensions"
                            render={ props => (
                              <TopologyTagList
                                {...props}
                                part="groups"
                                fieldName="groupsExtensions"
                                tagsState={extensionsState}
                                setTagsState={setExtensionsState}
                                tagsAll={allExtensions}
                              />
                            ) }
                          />
                          <div>
                            <hr style={{'borderTop': '1px solid #b5c4d1'}}/>
                          </div>
                          <CardTitle className="mb-2">
                            <strong>Entities</strong>
                          </CardTitle>
                          <FieldArray
                            name="entities"
                            render={props => (
                              <TopologyEntityFields
                                topoGroups={topoGroups}
                                addview={addview}
                                {...props}
                              />
                            )}
                          />
                        </CardBody>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="mt-3" data-testid='card-group-of-endpoints'>
                        <CardHeader>
                          <strong>Group of endpoints</strong>
                        </CardHeader>
                        <CardBody>
                          <CardTitle className="mb-2">
                            <strong>Tags</strong>
                          </CardTitle>
                          <FieldArray
                            name="endpointsTags"
                            render={propsLocal => (
                              <TopologyTagList
                                part="endpoints"
                                fieldName="endpointsTags"
                                tagsState={tagsState}
                                setTagsState={setTagsState}
                                tagsAll={allTags}
                                addview={addview}
                                {...propsLocal}/>
                            )}
                          />
                          <div>
                            <hr style={{'borderTop': '1px solid #b5c4d1'}}/>
                          </div>
                          <CardTitle className="mb-2">
                            <strong>Extensions</strong>
                          </CardTitle>
                          <FieldArray
                            name="endpointsExtensions"
                            render={ propsLocal => (
                              <TopologyTagList
                                {...propsLocal}
                                part="endpoints"
                                fieldName="endpointsExtensions"
                                tagsState={extensionsState}
                                setTagsState={setExtensionsState}
                                tagsAll={allExtensions}
                                addview={addview}
                              />
                            ) }
                          />
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </FormGroup>
              }
              <FormGroup className='mt-4'>
                <ParagraphTitle title='Thresholds'/>
                <Row>
                  <Col md={2} className='mr-4'>
                    <Label for='availabilityThreshold'>Availability:</Label>
                    <Field
                      id='availabilityThreshold'
                      name='availabilityThreshold'
                      className='form-control'
                    />
                    {
                      props.errors && props.errors.availabilityThreshold &&
                        FancyErrorMessage(props.errors.availabilityThreshold)
                    }
                  </Col>
                  <Col md={2} className='mr-4'>
                    <Label for='reliabilityThreshold'>Reliability:</Label>
                    <Field
                      id='reliabilityThreshold'
                      name='reliabilityThreshold'
                      className='form-control'
                    />
                    {
                      props.errors && props.errors.reliabilityThreshold &&
                        FancyErrorMessage(props.errors.reliabilityThreshold)
                    }
                  </Col>
                  <Col md={2} className='mr-4'>
                    <Label for='uptimeThreshold'>Uptime:</Label>
                    <Field
                      id='uptimeThreshold'
                      name='uptimeThreshold'
                      className='form-control'
                    />
                    {
                      props.errors && props.errors.uptimeThreshold &&
                        FancyErrorMessage(props.errors.uptimeThreshold)
                    }
                  </Col>
                  <Col md={2} className='mr-4'>
                    <Label for='unknownThreshold'>Unknown:</Label>
                    <Field
                      id='unknownThreshold'
                      name='unknownThreshold'
                      className='form-control'
                    />
                    {
                      props.errors && props.errors.unknownThreshold &&
                        FancyErrorMessage(props.errors.unknownThreshold)
                    }
                  </Col>
                  <Col md={2} className='mr-4'>
                    <Label for='downtimeThreshold'>Downtime:</Label>
                    <Field
                      id='downtimeThreshold'
                      name='downtimeThreshold'
                      className='form-control'
                    />
                    {
                      props.errors && props.errors.downtimeThreshold &&
                        FancyErrorMessage(props.errors.downtimeThreshold)
                    }
                  </Col>
                </Row>
              </FormGroup>
              {
                (write_perm && crud) &&
                <div className="submit-row d-flex align-items-center justify-content-between bg-light p-3 mt-5">
                  {
                    !addview ?
                      <Button
                        color="danger"
                        onClick={() => {
                          setModalMsg('Are you sure you want to delete Report?')
                          setModalTitle('Delete report')
                          setAreYouSureModal(!areYouSureModal);
                          setFormikValues(props.values)
                          setOnYes('delete')
                        }}>
                        Delete
                      </Button>
                    :
                      <div></div>
                  }
                  <Button color="success" id="submit-button" type="submit">Save</Button>
                </div>
              }
            </Form>
          )}
        </Formik>
      </BaseArgoView>
    )
  }

  else
    return null
};
