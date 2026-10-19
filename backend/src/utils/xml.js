const { create } = require('xmlbuilder2');

/**
 * Escapes and serializes an array of client records into XML
 * @param {Array} clients 
 * @param {String} rootName 
 * @returns {String} XML string
 */
function clientsToXml(clients, rootName = 'clients') {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele(rootName);
  
  if (Array.isArray(clients)) {
    clients.forEach((client) => {
      const item = root.ele('client');
      Object.keys(client).forEach((key) => {
        const val = client[key] !== null && client[key] !== undefined ? String(client[key]) : '';
        item.ele(key).txt(val);
      });
    });
  }

  return root.end({ prettyPrint: true });
}

/**
 * Serializes an aggregate query result into XML
 * @param {Object} aggregateData 
 * @returns {String} XML string
 */
function aggregateToXml(aggregateData) {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele('aggregate_result');

  if (aggregateData && typeof aggregateData === 'object') {
    Object.keys(aggregateData).forEach((key) => {
      const val = aggregateData[key] !== null && aggregateData[key] !== undefined ? String(aggregateData[key]) : '';
      root.ele(key).txt(val);
    });
  }

  return root.end({ prettyPrint: true });
}

/**
 * Generic query result serializer to XML
 * @param {Array} rows 
 * @param {String} rootName 
 * @param {String} itemName 
 * @returns {String} XML string
 */
function queryResultToXml(rows, rootName = 'query_result', itemName = 'record') {
  const root = create({ version: '1.0', encoding: 'UTF-8' }).ele(rootName);
  
  if (Array.isArray(rows)) {
    rows.forEach((row) => {
      const item = root.ele(itemName);
      Object.keys(row).forEach((key) => {
        const val = row[key] !== null && row[key] !== undefined ? String(row[key]) : '';
        item.ele(key).txt(val);
      });
    });
  }

  return root.end({ prettyPrint: true });
}

module.exports = {
  clientsToXml,
  aggregateToXml,
  queryResultToXml
};
