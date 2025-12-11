describe("Testes básicos do projeto", () => {

  test("soma simples deve funcionar", () => {
    const resultado = 2 + 2;
    expect(resultado).toBe(4);
  });

  test("objeto deve conter a chave correta", () => {
    const usuario = { nome: "Letícia", ativo: true };
    expect(usuario).toHaveProperty("nome");
    expect(usuario.nome).toBe("Letícia");
  });

  test("string deve conter substring", () => {
    const mensagem = "Startize projeto de exemplo";
    expect(mensagem).toMatch(/exemplo/);
  });
});
