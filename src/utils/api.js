class RequestError {
  constructor(status, message) {
    this.status = status
    this.message = message
  }
}

export const headers = () => ({
  'Content-Type': 'application/json',
})

export const makePostOptions = data => ({
  method: 'POST',
  headers: headers(),
  body: JSON.stringify(data)
})

export const makePatchOptions = data => ({
  ...makePostOptions(data),
  method: 'PATCH'
})

export const getOptions = () => ({
  method: 'GET',
  headers: headers()
})

export const deleteOptions = () => ({
  method: 'DELETE',
  headers: headers()
})

const request = (url, options) =>
  fetch(url, options).then(response => {
    const { status } = response

    if (status === 204) return {}
    const json = response.json()
    if (status >= 200 && status < 300) return json
    return json.then(message => {
      throw new RequestError(status, message)
    })
  })

export const get = url => request(url, getOptions())
export const post = (url, data) => request(url, makePostOptions(data))
export const del = (url, id) => request(url + id, deleteOptions())
export const patch = (url, data) => request(url, makePatchOptions(data))
