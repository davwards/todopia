export interface Task {
  title: string
  playerId: string
  status: Status
  createdAt: string
  id?: string
  deadline?: string
  parentRecurringTaskId?: string
}

export interface TaskRepository {
  findTasksForPlayer(playerId: string): Promise<Task[]>
  saveTask(task: Task): Promise<string>
  findTask(taskId: string): Promise<Task>
  findExpiredTasks(now: string): Promise<Task[]>
  findAllCompletableTasksForPlayer(playerId: string): Promise<Task[]>
  findInstancesOfRecurringTaskOnOrAfter(
    recurringTaskId: string,
    time: string,
  ): Promise<Task[]>
  findLastInstanceOfRecurringTask(
    recurringTaskId: string
  ): Promise<Task>
}

export interface RecurringTask {
  title: string
  playerId: string
  cadence: string
  duration?: string
  id?: string
}

export interface RecurringTaskRepository {
  saveRecurringTask(recurringTask: RecurringTask): Promise<string>
  findRecurringTask(taskId: string): Promise<RecurringTask>
  findRecurringTasksForPlayer(playerId: string): Promise<RecurringTask[]>
}

export interface AwardPrize {
  (playerId: string, prize: number): Promise<void>
}

export interface PenalizePlayer {
  (playerId: string, damage: number): Promise<void>
}

export interface FindNextOccurrence {
  (cadence: string, currentTime?: string): Promise<string>
}

export interface CalculateDeadlineFromDuration {
  (duration: string, currentTime: string): string
}

export enum Status {
  INCOMPLETE = "INCOMPLETE",
  COMPLETE = "COMPLETE",
  OVERDUE = "OVERDUE",
}
