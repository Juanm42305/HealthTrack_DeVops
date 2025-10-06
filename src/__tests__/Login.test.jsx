import { render, screen } from "@testing-library/react";
import Login from "../components/Login";
import { BrowserRouter } from "react-router-dom";

test("renderiza el formulario de login correctamente", () => {
  render(<BrowserRouter><Login /></BrowserRouter>);
  expect(screen.getByText("🔐 Iniciar Sesión")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
});
