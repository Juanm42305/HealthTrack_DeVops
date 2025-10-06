import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../components/Login";

test("renderiza el formulario de login correctamente", () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  // Ajusta los textos según tu componente
  expect(screen.getByText("🔐 Iniciar Sesión")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
});
