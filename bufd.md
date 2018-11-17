#Bounded contexts

## Players

### Domain Concepts

- assets
- currencies
  - health
  - magic
  - coin
- level
- buffs
- resurrect

## Tasks

### Domain Concepts

- todo
- habit
- recurring
- cadence
- duration
- deadline
- completion

### High Level Policy

#### Todo Repository

Given no todos have ever been created,
When I fetch todos for any player id,
Then the resulting list is empty.

Given I have created 3 todos for Player A
And I have created 4 todos for Player B
When I fetch todos for Player A
Then I get all of Player A's todos, but none of Player B's todos

Given I have created a todo for Player A
When I complete that todo
Then Player A receives a prize of xp and gold

Given I have created a todo for Player A
And I have not completed that todo
When I fetch todos for player A
Then the todo I created is in the list
And its status is "incomplete"

Given I have created a todo for Player A
And I have completed that todo
When I fetch todos for player A
Then the todo I created is in the list
And its status is "complete"

Given I have created a todo for Player A
And I have completed that todo
When I try to complete that todo again
Then I get an error because the todo is already completed
And Player A does not receive any prize

Given I have created a todo for Player A
And I have deleted that todo
When I fetch todos for player A
Then the todo I deleted is not in the list

## Spells

- spell list
- cast
- learn
- duration
- active effects

## Equipment

- equipment
- equipment type
- equipped
- purchase
