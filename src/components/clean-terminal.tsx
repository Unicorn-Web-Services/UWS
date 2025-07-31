"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Play, Square, RotateCcw, Maximize2, Minimize2 } from "lucide-react";

interface CleanTerminalProps {
  nodeId: string;
  containerId: string;
  containerName?: string;
  orchestratorUrl?: string;
  onClose?: () => void;
}

export default function CleanTerminal({
  nodeId,
  containerId,
  containerName,
  orchestratorUrl = "http://127.0.0.1:9000",
  onClose,
}: CleanTerminalProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const connectToTerminal = () => {
    if (!nodeId || !containerId) {
      console.error("Node ID and Container ID are required");
      return;
    }

    if (socket) {
      socket.close();
    }

    const wsUrl =
      orchestratorUrl
        .replace("http://", "ws://")
        .replace("https://", "wss://") +
      `/ws/terminal/${nodeId}/${containerId}`;

    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      setIsConnected(true);
      setTerminalOutput((prev) => [...prev, "🔗 Connected to terminal\n"]);
    };

    newSocket.onmessage = (event) => {
      const output = event.data;
      setTerminalOutput((prev) => [...prev, output]);

      // Auto-scroll to bottom
      setTimeout(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      }, 0);
    };

    newSocket.onclose = () => {
      setIsConnected(false);
      setTerminalOutput((prev) => [...prev, "❌ Terminal disconnected\n"]);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setTerminalOutput((prev) => [...prev, `❌ Error: ${error}\n`]);
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Auto-connect on mount
  useEffect(() => {
    connectToTerminal();
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [nodeId, containerId]);

  // Focus input when connected
  useEffect(() => {
    if (isConnected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isConnected]);

  return (
    <Card className={`${isFullscreen ? 'fixed inset-4 z-50' : 'w-full'} transition-all duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">
              Terminal - {containerName || containerId}
            </CardTitle>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearTerminal}
              title="Clear terminal"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                title="Close terminal"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-black text-green-400 font-mono text-sm">
          {/* Terminal Output */}
          <div
            ref={terminalRef}
            className="h-96 overflow-y-auto p-4 whitespace-pre-wrap"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
          >
            {terminalOutput.map((line, index) => (
              <div key={index} className="terminal-line">
                {line}
              </div>
            ))}
            {!isConnected && (
              <div className="text-yellow-400">
                ⚠️ Terminal not connected. Click connect to start.
              </div>
            )}
          </div>
          
          {/* Command Input */}
          <form onSubmit={sendCommand} className="border-t border-gray-700">
            <div className="flex items-center p-2">
              <span className="text-green-400 mr-2">$</span>
              <input
                ref={inputRef}
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={isConnected ? "Enter command..." : "Terminal disconnected"}
                disabled={!isConnected}
                className="flex-1 bg-transparent text-green-400 outline-none placeholder-gray-500"
                style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
              />
            </div>
          </form>
        </div>
        
        {/* Connection Controls */}
        <div className="p-3 bg-gray-50 border-t">
          <div className="flex items-center gap-2">
            {!isConnected ? (
              <Button size="sm" onClick={connectToTerminal}>
                <Play className="h-4 w-4 mr-1" />
                Connect
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={disconnectTerminal}>
                <Square className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            )}
            <span className="text-sm text-gray-500">
              Container: {containerId.substring(0, 8)}... | Node: {nodeId}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 