/** 
 * JSONSchema Validator - Validates JavaScript objects using JSON Schemas 
 *	(http://www.json.com/json-schema-proposal/)
 *
 * Copyright (c) 2007 Kris Zyp (www.xucia.com)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
To use the validator call JSONSchema.validate with an instance object and an optional schema object.
If a schema is provided, it will be used to validate. If the instance object refers to a schema (self-validating), 
that schema will be used to validate and the schema parameter is not necessary (if both exist, 
both validations will occur). 
The validate method will return an array of validation errors. If there are no errors, then an 
empty list will be returned. A validation error will have two properties: 
"property" which indicates which property had the error
"message" which indicates what the error was
 */
JSONSchema = {  	
	validate : function(instance,schema) {
		// validate an object against a schema
		function validate(instance,schema,path) {
			var errors = [];
			// validate a value against a property definition
			function checkProp(value, propDef, path) {
				path += (path ? '.' :'') + i;
				function addError(message) {
					errors.push({property:path,message:message});
				}
				// validate a value against a type definition
				function checkType(type) {
					if (typeof type == 'string' && type != 'any' && typeof value != type && !(value instanceof Array && type == 'array'))
						return [{property:path,message:(typeof value) + " value found, but a " + type + " is required"}];
					if (typeof type == 'object') {
						if (type instanceof Array) {
							var unionErrors=[];
							for (var j = 0; j < type.length; j++) 
								if (!(unionErrors=checkType(type[j])).length)
									break;
							return unionErrors;
						}
						else {
							if (typeof value != 'object') 
								return [{property:path,message:(typeof value) + " value found, but an object is required"}];
							else				
								return validate(value,type,path);
						}
					}
					return [];
				}
				if (!propDef.nullable && value === null)
					addError("is non-nullable, but has a null value");
				else  {
					if (value === undefined) {
						if (propDef.required)  
						addError("is missing and it is required");
					}
					else {
						errors = errors.concat(checkType(propDef.type));	 
						if (propDef.pattern && typeof value == 'string' && !value.match(propDef.pattern))
							addError("does not match the regex pattern " + propDef.pattern);
						if (propDef.length && typeof value == 'string' && value.length > propDef.length)
							addError("may only be " + propDef.length + " characters long");
						if (typeof propDef.minimum == 'number' && typeof value == 'number' && propDef.minimum > value)
							addError("must have a minimum value of " + propDef.minimum);
						if (typeof propDef.maximum == 'number' && typeof value == 'number' && propDef.maximum < value)
							addError("must have a maximum value of " + propDef.maximum);
						if (propDef.options && !propDef.unconstrained) {
							var l = propDef.options.length;
							var found;
							for (var j = 0; j < l; j++)
								if (propDef.options[j]===value) {
									found=1;
									break;
								}
							if (!found)
								addError("does not have a value in the options " + propDef.options.join(", "));
						}
					}
				}
			
			}
			if (schema) {
				if (typeof instance != 'object') {
					addError("an object is required");
				} 
				for (var i in schema) 
					if (schema.hasOwnProperty(i) && i != '*' && i != 'final' && i != 'prototype') {
						var value = instance[i];
						if (!isNaN(i))
							i = 'items';
						var propDef = schema[i];
						checkProp(value,propDef,path);
					}
			}
			for (var i in instance) {
				if (instance.hasOwnProperty(i) && schema && !schema[i] && schema['final']===true)
					errors.push({property:path,message:(typeof value) + "The property " + i + " is not defined in the schema and the schema is final"});
				value = instance[i];
				if (schema && !(i in schema) && ('*' in schema))
					checkProp(value,schema['*'],path); 
				if (value && value.schema)
					errors = errors.concat(validate(value,value.schema,path + '.' + i));
			}
			return errors;
		}
		var results = (schema ? validate(instance,schema,'') : []).concat(instance.schema ? validate(instance,instance.schema,'') : []);
			return results.length ? results : false;
	}
/* will add this later
	newFromStructure : function() {
	}
*/
}
