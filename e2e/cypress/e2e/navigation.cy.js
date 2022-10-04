/// <reference types="cypress" />

describe('Navigation', () => {
  const sizes = ['macbook-13', 'iphone-x', 'iphone-4'];

  beforeEach(() => {
    cy.login();
    cy.createRoom();
    cy.visitRoom();
  })

  it('displays the welcome message and navigation options on all screen sizes', () => {
    sizes.forEach(size => {
      cy.viewport(size);
      cy.waitForConnection();
      cy.get('button').contains('New Room').should('exist');
      cy.getUser().then((user) => {
        cy.get('button').contains(user.name).should('exist');
      });
      cy.screenshot(size);
    })
  })

  describe("New Room", () => {
    it("creates a new room", () => {
      const roomName = `Navigation Test Room ${new Date().toISOString()}`;
      cy.createRoom(roomName);
      cy.visitRoom();
      cy.get('.ant-page-header').contains(roomName).should('exist');
    });
  })
})
