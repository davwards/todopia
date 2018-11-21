export interface Task {
  title: string
  playerId: string
  status: Status
  id?: string
  deadline?: string
}

export interface TaskRepository {
  findTasksForPlayer(playerId: string): Promise<Task[]>
  saveTask(task: Task): Promise<string>
  findTask(taskId: string): Promise<Task>
  findExpiredTasks(now: string): Promise<Task[]>
  findAllCompletableTasksForPlayer(playerId: string): Promise<Task[]>
}

export interface AwardPrize {
  (playerId: string, prize: number): Promise<void>
}

export interface PenalizePlayer {
  (playerId: string, damage: number): Promise<void>
}

export enum Status {
  INCOMPLETE = "INCOMPLETE",
  COMPLETE = "COMPLETE",
  OVERDUE = "OVERDUE",
}
