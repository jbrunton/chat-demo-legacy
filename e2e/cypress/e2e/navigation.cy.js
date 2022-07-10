/// <reference types="cypress" />

describe('Navigation', () => {
  const roomId = "a1b2c3d4";

  beforeEach(() => {
    cy.login();
    cy.visit(`http://localhost:3000/rooms/${roomId}`)
    cy.get('li.ant-list-item').first().should('contain', 'Test User joined the chat. Welcome, Test User!');
  })

  it('displays the welcome message on all screen sizes', () => {
    const sizes = ['macbook-16', 'macbook-13', 'iphone-x', 'iphone-4'];
    sizes.forEach(size => {
      cy.viewport(size);
      cy.get('li.ant-list-item').contains('Test User joined the chat. Welcome, Test User!').should('exist');
      cy.screenshot(size);
    })
  })
})
