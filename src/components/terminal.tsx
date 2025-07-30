"use client";

import { useState, useRef, useEffect } from "react";

interface TerminalProps {
  nodeId: string;
  containerId: string;
  orchestratorUrl?: string;
}

export default function Terminal({
  nodeId,
  containerId,
  orchestratorUrl = "http://127.0.0.1:9000",
}: TerminalProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

  const connectToTerminal = () => {
    if (!nodeId || !containerId) {
      alert("Please provide both Node ID and Container ID");
      return;
    }

    if (socket) {
      socket.close();
    }

    // Convert HTTP URL to WebSocket URL properly
    const wsUrl =
      orchestratorUrl
        .replace("http://", "ws://")
        .replace("https://", "wss://") +
      `/ws/terminal/${nodeId}/${containerId}`;
    console.log("Connecting to:", wsUrl);

    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setTerminalOutput((prev) => [...prev, "=== Terminal Connected ===\n"]);
    };

    newSocket.onmessage = (event) => {
      const output = event.data;
      console.log("Terminal output:", output);
      setTerminalOutput((prev) => [...prev, output]);

      // Auto-scroll to bottom
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 0);
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      setTerminalOutput((prev) => [...prev, "=== Terminal Disconnected ===\n"]);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setTerminalOutput((prev) => [...prev, `Error: ${error}\n`]);
    };

    setSocket(newSocket);
  };

  const disconnectTerminal = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const sendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && isConnected && command.trim()) {
      const commandToSend = command.endsWith("\n") ? command : command + "\n";
      socket.send(commandToSend);
      setCommand("");
    }
  };

  const clearTerminal = () => {
    setTerminalOutput([]);
  };

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  // Auto-connect when nodeId and containerId are provided
  useEffect(() => {
    if (nodeId && containerId && !isConnected) {
      connectToTerminal();
    }
  }, [nodeId, containerId]);

  return (
    <div className="bg-gray-900 text-green-400 rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 text-white">
        Container Terminal
      </h2>

      {/* Connection Controls */}
      <div className="mb-4 space-y-2">
        <div className="flex gap-2 text-sm text-gray-300">
          <span>
            Node: <strong className="text-white">{nodeId || "Not set"}</strong>
          </span>
          <span>
            Container:{" "}
            <strong className="text-white">{containerId || "Not set"}</strong>
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={connectToTerminal}
            disabled={isConnected || !nodeId || !containerId}
            className={`px-4 py-2 rounded-md font-medium ${
              isConnected || !nodeId || !containerId
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isConnected ? "Connected" : "Connect Terminal"}
          </button>

          <button
            onClick={disconnectTerminal}
            disabled={!isConnected}
            className={`px-4 py-2 rounded-md font-medium ${
              !isConnected
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            Disconnect
          </button>

          <button
            onClick={clearTerminal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="bg-black p-4 rounded-md h-64 overflow-y-auto font-mono text-sm mb-4 border border-gray-600"
      >
        {terminalOutput.length === 0 ? (
          <div className="text-gray-500">
            Terminal output will appear here...
          </div>
        ) : (
          terminalOutput.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap break-words">
              {line}
            </div>
          ))
        )}
      </div>

      {/* Command Input */}
      <form onSubmit={sendCommand} className="flex gap-2">
        <span className="text-green-400 self-center">$</span>
        <input
          type="text"
          placeholder="Enter command..."
          className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!isConnected || !command.trim()}
          className={`px-4 py-2 rounded-md font-medium ${
            !isConnected || !command.trim()
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          Send
        </button>
      </form>

      <div className="mt-2 text-xs text-gray-400">
        Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
      </div>
    </div>
  );
}
