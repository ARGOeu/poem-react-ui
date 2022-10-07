import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Form,
  Row,
  Col,
  Table,
  Button,
  Input
} from 'reactstrap';
import { Backend } from './DataManager';
import {
  LoadingAnim,
  ErrorComponent,
  SearchField,
  NotifyOk,
  ModalAreYouSure
} from './UIElements';
import {
  faSearch,
  faTimes,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch
} from 'react-hook-form';


const PortsList = ({ data }) => {
  const backend = new Backend()

  const queryClient = useQueryClient()

  const { control, setValue, getValues, handleSubmit } = useForm({
    defaultValues: {
      defaultPorts: data.length > 0 ? data : [{ id: 0, name: "", value: "" }],
      searchPortName: "",
      searchPortValue: ""
    }
  })

  const mutation = useMutation(async (values) => await backend.addObject("/api/v2/internal/default_ports/", values))

  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMsg, setModalMsg] = useState('')
  const [modalFunc, setModalFunc] = useState(undefined)

  const searchPortName = useWatch({ control, name: "searchPortName" })
  const searchPortValue = useWatch({ control, name: "searchPortValue" })

  const { fields, insert, remove } = useFieldArray({ control, name: "defaultPorts" })

  useEffect(() => {
    setValue("defaultPorts", data.length > 0 ? data : [{ id: 0, name: "", value: "" }])
  }, [data])

  const toggleModal = () => {
    setAreYouSureModal(!areYouSureModal)
  }

  const onSubmit = () => {
    setModalMsg("Are you sure you want to change default ports?")
    setModalTitle("Change default ports")
    setModalFunc(() => doSave)
    setAreYouSureModal(!areYouSureModal)
  }

  const doSave = () => {
    let sendData = {
      ports: [...getValues("defaultPorts").map((e) => new Object({ name: e.name, value: e.value }))]
    }

    mutation.mutate(sendData, {
      onSuccess: () => {
        queryClient.invalidateQueries("defaultports")
        NotifyOk({
          msg: "Default ports successfully changed",
          title: "Changed",
        })
      }
    })
  }

  let fieldsView = fields

  if (searchPortName)
    fieldsView = fields.filter(e => e.name.toLowerCase().includes(searchPortName.toLowerCase()))

  if (searchPortValue)
    fieldsView = fields.filter(e => e.value.toLowerCase().includes(searchPortValue.toLowerCase()))

  return (
    <>
      <ModalAreYouSure
        isOpen={areYouSureModal}
        toggle={toggleModal}
        title={modalTitle}
        msg={modalMsg}
        onYes={modalFunc}
      />
      <div className="d-flex align-items-center justify-content-between">
        <h2 className="ms-3 mt-1 mb-4">Default ports</h2>
        <span>
          <Button color="success" type="submit" onClick={(e) => onSubmit(e)}>Save</Button>
        </span>
      </div>
      <div id="argo-contentwrap" className="ms-2 mb-2 mt-2 p-3 border rounded">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col>
              <Table bordered responsive hover size="sm">
                <thead className="table-active table-bordered align-middle text-center">
                  <tr>
                    <th style={{width: "5%"}}>#</th>
                    <th>Port name</th>
                    <th>Port value</th>
                    <th style={{ width: "5%" }}>Action</th>
                  </tr>
                </thead>
                <tbody style={{ lineHeight: "2.0" }}>
                  <tr style={{ background: "#ECECEC" }}>
                    <td className="align-middle text-center">
                      <FontAwesomeIcon icon={faSearch}/>
                    </td>
                    <td className="align-middle text-center">
                      <Controller
                        name="searchPortName"
                        control={control}
                        render={ ({ field }) =>
                          <SearchField
                            field={field}
                            forwardedRef={field.ref}
                            className="form-control"
                          />
                        }
                      />
                    </td>
                    <td className="align-middle text-center">
                      <Controller
                        name="searchPortValue"
                        control={control}
                        render={ ({field}) =>
                          <SearchField
                            field={field}
                            forwardedRef={field.ref}
                            className="form-control"
                          />
                        }
                      />
                    </td>
                    <td></td>
                  </tr>
                  {
                    fieldsView.map((entry, index) =>
                      <tr key={entry.id}>
                        <td className="align-middle text-center">
                          { index + 1 }
                        </td>
                        <td className="align-middle text-left fw-bold">
                          {
                            entry.name == "" ?
                              <Controller
                                name={`defaultPorts.${index}.name`}
                                control={control}
                                render={({field}) =>
                                  <Input
                                    {...field}
                                    data-testid={`defaultPorts.${index}.name`}
                                    className="form-control"
                                  />
                                }
                              />
                            :
                              <span className="ms-2">{ entry.name }</span>
                          }
                        </td>
                        <td className="align-middle text-left">
                          {
                            entry.value == "" ?
                              <Controller
                                name={`defaultPorts.${index}.value`}
                                control={control}
                                render={({field}) =>
                                  <Input
                                    {...field}
                                    data-testid={`defaultPorts.${index}.value`}
                                    className="form-control"
                                  />
                                }
                              />
                            :
                              <span className="ms-2">{ entry.value }</span>
                          }
                        </td>
                        <td className="align-middle text-center">
                          <Button
                            size="sm"
                            color="light"
                            type="button"
                            data-testid={`remove-${index}`}
                            onClick={() => remove(index)}
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                          <Button
                            size="sm"
                            color="light"
                            type="button"
                            data-testid={`insert-${index}`}
                            onClick={() => {
                              insert(index + 1, {id: "0", name: "", value: ""})
                            }}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </Table>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  )
}


export const DefaultPortsList = () => {
  const backend = new Backend();

  const { data: defaultPorts, error, status } = useQuery(
    "defaultports", async () => {
      return await backend.fetchData("/api/v2/internal/default_ports")
    }
  )

  if (status === 'loading')
    return (<LoadingAnim/>);

  else if (status === 'error')
    return (<ErrorComponent error={error}/>);

  else if (defaultPorts) {
    return (
      <PortsList data={defaultPorts} />
    )
  }
  else
    return null
}