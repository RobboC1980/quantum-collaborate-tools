
/**
 * Validation utility functions for handling null/undefined/empty values throughout the application
 */

/**
 * Ensures a string value is not empty, null, or undefined
 * @param value The string value to validate
 * @param defaultValue The default value to return if the input is invalid
 * @returns A valid string that is never empty, null, or undefined
 */
export const validateString = (value: string | undefined | null, defaultValue: string = 'unknown'): string => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value;
};

/**
 * Validates a select/dropdown value, ensuring it's never empty
 * @param value The select value to validate
 * @param defaultValue The default value to use if invalid (defaults to 'all')
 * @returns A valid select value
 */
export const validateSelectValue = (value: string | undefined | null, defaultValue: string = 'all'): string => {
  return validateString(value, defaultValue);
};

/**
 * Validates a numeric value, ensuring it's never NaN or invalid
 * @param value The number to validate
 * @param defaultValue The default number to use if invalid
 * @returns A valid number
 */
export const validateNumber = (value: number | undefined | null, defaultValue: number = 0): number => {
  if (value === undefined || value === null || isNaN(Number(value))) {
    return defaultValue;
  }
  return Number(value);
};

/**
 * Validates an ID value, ensuring it follows expected format
 * @param id The ID to validate
 * @param prefix Optional prefix to prepend if generating a fallback ID
 * @returns A valid ID string
 */
export const validateId = (id: string | undefined | null, prefix: string = 'ID'): string => {
  if (id === undefined || id === null || id === '') {
    // Generate a random ID with the prefix
    return `${prefix}-${Math.floor(Math.random() * 10000)}`;
  }
  return id;
};

/**
 * Safely accesses a nested property that might be undefined
 * @param obj The object to access
 * @param path The path to the property, e.g. 'user.address.street'
 * @param defaultValue The default value to return if the path is invalid
 * @returns The property value or the default value
 */
export const safelyGetNestedProperty = (
  obj: any,
  path: string,
  defaultValue: any = undefined
): any => {
  const travel = (obj: any, path: string[]): any => {
    if (obj === undefined || obj === null) return defaultValue;
    if (path.length === 0) return obj;
    return travel(obj[path[0]], path.slice(1));
  };
  
  return travel(obj, path.split('.'));
};

/**
 * Validates a date value, ensuring it's a valid Date object
 * @param date The date to validate
 * @param defaultDate The default date to use if invalid (defaults to now)
 * @returns A valid Date object
 */
export const validateDate = (
  date: Date | string | number | undefined | null,
  defaultDate: Date = new Date()
): Date => {
  if (date === undefined || date === null) {
    return defaultDate;
  }
  
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    return defaultDate;
  }
  
  return parsedDate;
};
