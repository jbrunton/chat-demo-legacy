/// <reference types="cypress" />

describe('example to-do app', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/rooms/a1b2c3d4')
  })

  it('displays a welcome message', () => {
    cy.get('li.ant-list-item').first().should('contain', 'joined the chat. Welcome, User');
  })

  it('lets the user send a message', () => {
    cy.get('input').type('Hello, World!{enter}');
    cy.get('li.ant-list-item').last().should('contain', 'Hello, World!');
  })
})
