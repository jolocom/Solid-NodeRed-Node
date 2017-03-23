const request = require('request')
const rdf = require('./rdf.js')

module.exports = {

  checkIfExists: (url, credentials, delegate, delegator) => {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'HEAD',
        url: url,
        cert: credentials.certFile,
        key: credentials.keyFile,
        headers: delegate ? {
          'on-behalf-of': delegator
        } : {}
      }

      return request(options, (err, res) => {
        if (err) return resolve(false)
        return resolve(res.statusCode === 200)
      })
    })
  },

  initWithData: (data, url, credentials, delegate, delegator) => {
    const body = rdf.rdfFileBoilerplate(data, url)
    request({
      method: "PUT",
      url: url,
      body: body,
      cert: credentials.certFile,
      key: credentials.keyFile,
      headers: delegate ? {
        'on-behalf-of': delegator
      } : {}
    })
  },

  addSinkToIndex: (credentials, url) => {
    const fullGwWebId = `https://${credentials.webId}/profile/card#me`
    const query = rdf.addSinkQuery(fullGwWebId, url)
    request({
      method: "PATCH",
      url: fullGwWebId,
      body: `INSERT DATA { ${query} };`,
      cert: credentials.certFile,
      key: credentials.keyFile,
      headers: {
        'Content-Type': 'application/sparql-update'
      }
    })
  },

  appendData: (data, url, credentials, delegate, delegator) => {
    const query = rdf.wrapInRdf(data, url)
    request({
      method: "PATCH",
      url: url,
      body: `INSERT DATA { ${query} };`,
      cert: credentials.certFile,
      key: credentials.keyFile,
      headers: delegate ? {
        'on-behalf-of': delegator,
        'Content-Type': 'application/sparql-update'
      } : {
        'Content-Type': 'application/sparql-update'
      }
    })
  }
}
