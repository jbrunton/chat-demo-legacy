export const get = async <T>(url: string): Promise<T> => {
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await resp.json();
};

export const post = async <T>(url: string, body?: string): Promise<T> => {
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  return await resp.json();
};
