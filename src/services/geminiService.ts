const API_URL = 'https://calculator-api.46261vor.workers.dev';

interface LogEntry {
  requestId: string;
  timestamp: string;
  query: string;
  response: string;
  price?: number;
  feedback?: number;
}

export async function sendMessage(message: string): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function loadLogs(): Promise<Array<{ request: string, response: string, actualPrice?: string }>> {
  try {
    const response = await fetch(`${API_URL}/api/logs`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.logs || [];
  } catch (error) {
    console.error('Error loading logs:', error);
    return [];
  }
}

export async function getLogs(): Promise<LogEntry[]> {
  try {
    const response = await fetch(`${API_URL}/api/logs`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch logs');
    }

    const data = await response.json();
    return data.logs;
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
}

export async function sendFeedback(requestId: string, actualPrice: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId, actualPrice }),
    });

    if (!response.ok) {
      throw new Error('Failed to send feedback');
    }

    return true;
  } catch (error) {
    console.error('Error sending feedback:', error);
    throw error;
  }
} 