"use client";

import ReadmeViewer from "@/components/common/ReadmeViewer";
import { BASE_URL } from "@/lib/config/appwrite";
import { ITask } from "@/lib/types/task";
import { Edit2, Send, Trash2, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

type IMessage = {
  role: "user" | "assistant";
  content: string;
};

const HomePage = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);

  const [messages, setMessages] = useState<IMessage[]>([]);

  const [prompt, setPrompt] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const refetch = async () => {
    fetch(`${BASE_URL}/tasks`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setTasks(data.data);
        }
      });
  };

  useEffect(() => {
    refetch();
  }, []);

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task._id !== id));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formPromptValue = (
      form.elements.namedItem("prompt") as HTMLInputElement
    ).value;

    if (formPromptValue) {
      // Add the user message first
      const newMessages: IMessage[] = [
        ...messages,
        { role: "user", content: formPromptValue },
      ];
      setMessages(newMessages); // Update the state

      form.reset();
      setPrompt("");

      // Send the updated messages array in the request
      fetch(`${BASE_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: formPromptValue,
          messages: newMessages,
        }), // Use updated messages
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) {
            const allMessages: IMessage[] = [
              ...newMessages,
              { role: "assistant", content: data.data.content as string },
            ];
            setMessages(allMessages);

            if (data?.refetch) {
              refetch();
            }
          }
        });
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    const cursorPos = event.target.selectionStart || text.length; // Get cursor position
    setPrompt(text);

    // Check last three characters before cursor match "id:"
    if (cursorPos >= 3 && text.slice(cursorPos - 3, cursorPos) === "id:") {
      setOpenModal(true);
    } else {
      setOpenModal(false);
    }
  };

  const handleSetId = (id: string) => {
    if (!id) return;

    setPrompt((prevInputValue) => {
      const cursorPos = prevInputValue.length;

      // Find the last occurrence of "id:" before the cursor
      const idIndex = prevInputValue.lastIndexOf("id:", cursorPos - 1);

      // Check if "id:" exists before the cursor position
      if (idIndex !== -1) {
        const beforeId = prevInputValue.slice(0, idIndex + 3); // Keep "id:"
        const afterId = prevInputValue.slice(idIndex + 3).trimStart(); // Remove spaces after "id:"

        // Construct the new text by replacing "id:" with "id:<username>"
        const newText = beforeId + id + " " + afterId;
        return newText;
      }

      // If no "id:" found, just append "id:<username>" at the end
      return prevInputValue + ` id:${id} `;
    });

    setOpenModal(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-950 text-gray-100">
      {/* Task List */}
      <div className="w-full md:w-1/2 p-6 overflow-auto">
        <h2 className="text-3xl font-bold mb-6 text-blue-400">Task List</h2>
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task: ITask, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-800 hover:bg-gray-850 transition-colors"
                >
                  <td className="p-3">{task.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                      ${
                        task.status === "Completed"
                          ? "bg-green-500 text-green-900"
                          : task.status === "In Progress"
                          ? "bg-yellow-500 text-yellow-900"
                          : "bg-red-500 text-red-900"
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="text-blue-400 hover:text-blue-300 mr-2">
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Chat */}
      <div className="w-full md:w-1/2 p-6 flex flex-col bg-gray-900">
        <h2 className="text-3xl font-bold mb-6 text-green-400">
          AI Task Assistant
        </h2>
        <div className="flex-grow overflow-auto mb-4 bg-gray-950 rounded-lg p-4 shadow-inner">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`mb-4 p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-900 ml-8"
                  : "bg-gray-800 mr-8"
              }`}
            >
              <p
                className={`font-semibold mb-1 ${
                  message.role === "user" ? "text-blue-300" : "text-green-300"
                }`}
              >
                {message.role === "user" ? "You" : "AI Assistant"}
              </p>
              {message.role === "user" ? (
                <p>{message.content}</p>
              ) : (
                <ReadmeViewer content={message.content} />
              )}
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-gray-800 min-h-[50px] rounded-lg relative w-full"
        >
          {openModal && (
            <div>
              <div className="absolute bottom-[48px] left-0 w-full max-w-[400px] min-h-[450px] max-h-[450px] overflow-y-auto bg-gray-800 rounded-t-lg shadow-md">
                <div className="w-full h-full grid grid-cols-1 gap-2 relative">
                  <div className="w-full h-full flex justify-center items-center">
                    <button
                      type="button"
                      onClick={() => setOpenModal(false)}
                      className="absolute top-0 right-0 p-2 bg-gray-900 text-gray-
                    300 hover:bg-gray-800 rounded-lg"
                    >
                      <XIcon className="h-6 w-6" />
                    </button>
                  </div>
                  {tasks.map((task: ITask, index) => (
                    <div
                      key={index}
                      onClick={() => handleSetId(task._id)}
                      className="hover:bg-slate-300 px-4 py-1 cursor-pointer hover:text-black"
                    >
                      <h1>{task.name}</h1>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <input
            onChange={handleInput}
            type="text"
            value={prompt}
            name="prompt"
            placeholder="Ask AI to generate a task..."
            className="flex-grow p-3 bg-transparent text-gray-100 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-green-600 text-white p-3 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
