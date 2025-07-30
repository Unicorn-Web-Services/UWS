"use server";

export async function createContainer(config: {
  image: string;
  name?: string;
  env?: Record<string, string>;
  cpu: number;
  memory: string;
  ports?: Record<string, number>;
}) {
  const orchestratorUrl =
    process.env.ORCHESTRATOR_ENDP || "http://127.0.0.1:9000";
  const response = await fetch(`${orchestratorUrl}/launch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error("Failed to create container");
  }

  return response.json();
}
