import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../components/Login";

test("renderiza el formulario de login correctamente", () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  // Coincidir con el texto real del componente
  expect(screen.getByText("Pantalla de Login")).toBeInTheDocument();
  expect(screen.getByText("Componente base funcionando correctamente ✅")).toBeInTheDocument();
});
