const selectAgent = async ({ agentName }) => {
  return {
    status: 200,
    data: {
      action: "SWITCH_AGENT",
      agent: agentName
    }
  }
}

const selectAgentTool = {
  type: "function",
  function: {
    name: "selectAgentTool",
    description: "Seleciona o agente especializado mais apropriado para responder ao prompt do usuário.",
    parameters: {
      type: "object",
      properties: {
        agentName: {
          type: "string",
          description: "O nome exato do agente a ser ativado (ex: 'Desenvolvedor', 'Padrão', 'Redator')."
        }
      },
      required: ["agentName"]
    }
  }
}

module.exports = { selectAgent, selectAgentTool }
