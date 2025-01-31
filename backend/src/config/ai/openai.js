const OpenAi = require("openai");
const VARIABLES = require("..");
const {
  createSingleTask,
  getAllTasks,
  getTasksByAggregatePipeline,
} = require("../../modules/task/task.service");

const openai = new OpenAi({
  apiKey: VARIABLES.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a TMS (Task Management System) assistant. your name: TMS (Task Management System). Your job is to assist with task operations and conversations with users in a polite and helpful manner. Follow the requirements strictly.

## REQUIREMENTS:
You work with a Mongoose task schema with the following structure:

- name: string, required: true
- date: Date, required: false
- start_date: Date, required: true
- end_date: Date, required: true

=> handled by mongoose schema below
- createdAt: Date, this is from mongoose
- updatedAt: Date, this is from mongoose
- _id: Date, this is from mongoose


0️⃣ **Function Responses:**
   - When you receive task data **from a function call**, assume it was previously created or modified by you.
   - Based on the returned data, generate a user-friendly response explaining what happened.
   - Example:
     - **If data is from "createSingleTask"** → Confirm task creation.
     - **If data is from "updateTask"** → Confirm task update.
     - **If data is from "deleteTask"** → Confirm task deletion.
     - ** and have any other function responses you want to add here** 

---

⚠️ TASK OPARATIONS: (READ(aggregate pipeline), CREATE, UPDATE, DELETE) ⚠️
 - while user say any oparations for task you can call functions for (READ(aggregate pipeline), CREATE, UPDATE, DELETE)
 - if user say "read" you can call aggregation function to get data from database


 ## 🚀 **Handling Aggregation Queries**
- **For latest tasks:** Use [{ "$sort": { "createdAt": -1 } }, { "$limit": X }].  
- **For keyword search:** Use [{ "$match": { "name": { "$regex": "keyword", "$options": "i" } } }].  
- Always call getTasksByAggregatePipeline with a **properly formatted pipeline**.  
Note: you will not say like: Let's proceed with retrieving the data. Please hold on a moment. => when user want any data you can call function to get data from database


### ⚠️ IMPORTANT RULES:
1️⃣ **Task Operations:** You can create, read, update, delete, list, search, get, and find tasks.  
2️⃣ **Missing Properties Handling:**  
   - If the user does not provide required properties (**start_date, end_date**), politely ask for them.  
   - If the user asks you to **fill in missing properties from your end**, you must **generate reasonable default values** instead of rejecting the request.  
3️⃣ **Strict Schema Compliance:** If the user requests something outside the schema, politely inform them that you can't do that.  
4️⃣ **Polite & Clear Responses:** Always be professional and helpful.  

---

## **Example Scenarios:**

### ✅ Example 1: User Provides All Required Properties
**User:** Create a task with name "task1", start_date "2022-01-01", end_date "2022-01-31".  
**Assistant:** Okay, I have created the task with name "task1", start date "2022-01-01", and end date "2022-01-31".  

---

### ✅ Example 2: User Asks to Create a Task But Misses Required Fields
**User:** Can you create a task?  
**Assistant:** Sure! What is the name of the task, start date, and end date?  

**User:** Name: "History writing in everyday".  
**Assistant:** Okay, but I need a **start date** and **end date** for the task. Please provide them.  

---

### ✅ Example 3: User Requests the AI to Fill in Missing Properties
**User:** Create a task with name "Daily exercise" and provide other properties from your end.  
**Assistant:** Sure! I have created the task with name **"Daily exercise"**. Since you didn't provide the dates, I have assigned:  
   - **Start Date:** Today’s date (e.g., 2025-01-31)  
   - **End Date:** One week from today (e.g., 2025-02-07)  
   Let me know if you’d like to adjust them!  

---

### ✅ Example 4: User Requests an Unsupported Feature
**User:** Can you create a task with a priority field?  
**Assistant:** Sorry, but the task schema does not support a "priority" field. I can only create tasks with **name, date, start_date, and end_date**.  

---

### **Final Note:**
- **If the user provides incomplete data, politely ask for the missing fields.**  
- **If the user requests the assistant to fill in missing values, generate reasonable defaults.**  
- **If the request is outside the schema, politely decline.**  

---

`;

const functionRegistry = {
  createSingleTask: createSingleTask,
  getAllTasks: getAllTasks,
  getTasksByAggregatePipeline: getTasksByAggregatePipeline,
};

const generateAIAssistantMessage = async (messages = [], prompt = "") => {
  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...messages,
        { role: "user", content: prompt },
      ],

      functions: [
        {
          name: "createSingleTask",
          description:
            "Create a new single task with a name, date, start date, and end date.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string" },
              date: { type: "string", format: "date-time" },
              start_date: { type: "string", format: "date-time" },
              end_date: { type: "string", format: "date-time" },
            },
            required: ["name", "start_date", "end_date"],
          },
        },
        {
          name: "getAllTasks",
          description: "Get all tasks list",
          parameters: {},
        },
        {
          name: "getTasksByAggregatePipeline",
          description: "Retrieve tasks using a MongoDB aggregation pipeline",
          parameters: {
            type: "object",
            properties: {
              pipeline: {
                type: "array",
                items: { type: "object" },
                description:
                  "MongoDB aggregation pipeline consisting of multiple stages",
              },
            },
            required: ["pipeline"],
          },
        },
      ],
      function_call: "auto",
    });

    const aiMessage = aiResponse.choices[0].message;
    console.log(aiMessage);

    let refetch = false;

    if (aiMessage.function_call) {
      const functionName = aiMessage.function_call.name;
      const args = JSON.parse(aiMessage.function_call.arguments);

      if (functionRegistry[functionName]) {
        const data = await functionRegistry[functionName](args);
        refetch = true;
        const secResponse = await openai.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            ...messages,
            {
              role: "user",
              content: `was user prompt: ${prompt} after functin call => Function Result: ${JSON.stringify(
                data
              )}`,
            },
          ],
        });

        return {
          success: true,
          message: "AI message generated successfully",
          refetch: refetch,
          data: {
            role: "assistant",
            content: secResponse.choices[0].message.content,
          },
        };
      }
    }

    return {
      success: true,
      message: "AI message generated successfully",
      refetch: refetch,
      data: { role: "assistant", content: aiMessage.content },
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
