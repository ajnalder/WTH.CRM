
import { TaskPlanningHeader } from "@/components/task-planning/TaskPlanningHeader";
import { TaskPlanningControls } from "@/components/task-planning/TaskPlanningControls";
import { TaskPool } from "@/components/task-planning/TaskPool";
import { ScheduledTasksList } from "@/components/task-planning/ScheduledTasksList";
import { useTaskPlanning } from "@/hooks/useTaskPlanning";

const ProjectPlanning = () => {
  const {
    tasks,
    scheduledTasks,
    selectedDate,
    setSelectedDate,
    handleDateChange,
    handleTaskDrop,
    handleTaskRemove
  } = useTaskPlanning();

  return (
    <div className="p-6 space-y-6">
      <TaskPlanningHeader />
      <TaskPlanningControls 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaskPool 
          tasks={tasks}
          onTaskDrop={handleTaskDrop}
        />
        <ScheduledTasksList 
          scheduledTasks={scheduledTasks}
          selectedDate={selectedDate}
          onTaskRemove={handleTaskRemove}
        />
      </div>
    </div>
  );
};

export default ProjectPlanning;
