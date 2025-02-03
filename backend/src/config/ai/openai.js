const OpenAi = require("openai");
const VARIABLES = require("..");
const { ai_agent_data } = require("./aiData");

const openai = new OpenAi({
  apiKey: VARIABLES.OPENAI_API_KEY,
});

const generateAIAssistantMessage = async (allMessages = [], prompt = "") => {
  try {
    const messages = [
      {
        role: "system",
        content: ai_agent_data.system_prompt,
      },
      ...allMessages,
      { role: "user", content: prompt },
    ];
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: messages,
      tools: ai_agent_data.tools,
      store: true,
    });

    const tool_calls = completion.choices[0].message.tool_calls;

    let result = null;
    let refetch = false;

    if (tool_calls?.length > 0) {
      for (const toolCall of tool_calls) {
        console.log(toolCall);
        messages.push(completion.choices[0].message);
        if (toolCall.type === "function") {
          const name = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments);

          const functionResponse = await ai_agent_data.functionRegistry[name](
            args
          );
          if (functionResponse?.refetch === true && !refetch) {
            refetch = true;
          }
          const jsonResult = await JSON.stringify(functionResponse, null, 2);

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: jsonResult,
          });
        }
      }

      const completion2 = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages,
        tools: ai_agent_data.tools,
        store: true,
      });

      result = completion2.choices[0].message.content;
    } else {
      result = completion.choices[0].message.content;
    }

    return {
      success: true,
      message: "AI message generated successfully",
      refetch: refetch,
      data: {
        role: "assistant",
        content: result,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: "AI message generated unsuccessfully",
      data: null,
      error: error.message,
    };
  }
};

module.exports = {
  generateAIAssistantMessage,
};
