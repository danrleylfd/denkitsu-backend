const { tools, availableTools } = require("../tools")

const transformToMcpTool = (openApiTool) => {
  const { name, description, parameters } = openApiTool.function
  return {
    id: name,
    name: name,
    description: description,
    parameters: {
      type: "object",
      properties: parameters.properties,
      required: parameters.required || [],
    },
    returns: {
      type: "object",
      properties: {
        status: { type: "number" },
        data: { type: "object" },
      },
    },
    "protocol_version": "1.0",
  }
}

const mcpTools = tools.map(transformToMcpTool)

const getResources = () => {
  return {
    resources: mcpTools.map(({ id, name, description }) => ({
      id,
      name,
      description,
    })),
  }
}

const getResourceById = (resourceId) => {
  const resource = mcpTools.find((tool) => tool.id === resourceId)
  return resource
}

const executeResource = async (resourceId, params) => {
  const toolFunction = availableTools[resourceId]
  if (!toolFunction) {
    throw new Error("RESOURCE_NOT_FOUND")
  }
  if (resourceId === "executeHttpRequest") {
    return await toolFunction(params)
  }
  return await toolFunction(...Object.values(params))
}

module.exports = {
  getResources,
  getResourceById,
  executeResource,
}
