/**
 * This function is a placeholder for a user-defined composable that returns the Drizzle instance.
 * Users should implement this function in their application to provide the actual Drizzle instance.
 */
export function useDrizzle() {
  return {
    dialect: {
      migrate: () => {
        throw new Error('No Drizzle instance found. Please implement a useDrizzle nitro composable and return your Drizzle instance.')
      },
    },
  }
}
