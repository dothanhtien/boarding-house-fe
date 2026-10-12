"use client";

import { useEffect, useState } from "react";

export function useObjectUrls(files: File[]) {
  const [state, setState] = useState<{ files: File[]; urls: string[] }>({
    files: [],
    urls: [],
  });

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ files, urls });
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return state.files === files ? state.urls : [];
}
