import { redirect } from "react-router-dom";

export const loadMe = async () => {
    const response = await fetch("http://localhost:8080/me", {
        credentials: "include"
    });

    if (response.status === 401) {
        const res = await fetch("http://localhost:8080/logout", {
          credentials: "include",
        });
    
        if (res.ok) return redirect("/login");
      }

    const me = await response.json();

    return me;
};
