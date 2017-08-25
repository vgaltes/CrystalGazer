namespace VGA.Mutations.Mutators
{
    using System.Collections.Generic;
    using System.IO;
    using System.Linq;
    using Mono.Cecil;
    using Mono.Cecil.Cil;
    using Mono.Cecil.Rocks;

    public class TestDiscoverer
    {
        public List<TestToExecute> DiscoverTestsToExecute(string assemblyToTestPath, string typeToTestFullName, string methodToTestName)
        {
            var assemblyToTest = AssemblyDefinition.ReadAssembly(assemblyToTestPath);
            var methodToTestDefinition =
                assemblyToTest.MainModule.GetType(typeToTestFullName).Methods.First(m => m.Name == methodToTestName);

            var testsToExecute = new List<TestToExecute>();
            
            foreach (var file in Directory.EnumerateFiles(".", "*.dll"))
            {
                var testAssembly = AssemblyDefinition.ReadAssembly(file);
                var testMethods = GetTestMethodsInAssembly(testAssembly);

                foreach (var testMethod in testMethods)
                {
                    GetTestsThatCall(testMethod, testsToExecute, methodToTestDefinition, file);
                }
            }

            return testsToExecute;
        }

        private static void GetTestsThatCall(MethodDefinition testMethod, List<TestToExecute> testsToExecute,
            MethodDefinition methodToTest, string testAssemblyPath)
        {
            var possibleCalls = GetCallsInMethod(testMethod);
            testsToExecute.AddRange(GetTestsThatCall(methodToTest, possibleCalls,
                testAssemblyPath, testMethod));
        }

        private static IEnumerable<TestToExecute> GetTestsThatCall(MethodDefinition methodToMutate,
            IEnumerable<Instruction> possibleCalls,
            string testAssemblyPath, MethodDefinition possibleTestMethod)
        {
            var tests = new List<TestToExecute>();

            tests.AddRange(
                from method in
                    possibleCalls.Select(possibleCall => possibleCall.Operand).OfType<MethodReference>()
                where method.FullName == methodToMutate.FullName
                select
                    new TestToExecute(testAssemblyPath,
                        possibleTestMethod.DeclaringType.FullName, possibleTestMethod.Name)
                );

            return tests;
        }

        private static IEnumerable<Instruction> GetCallsInMethod(MethodDefinition possibleTestMethod)
        {
            return possibleTestMethod.Body.Instructions.Where(i => i.OpCode == OpCodes.Callvirt);
        }

        private static IEnumerable<MethodDefinition> GetTestMethodsInAssembly(AssemblyDefinition possibleTestAssembly)
        {
            var methods = possibleTestAssembly.MainModule.GetTypes()
                .SelectMany(t => t.GetMethods())
                .Where(
                    m =>
                        m.HasCustomAttributes
                        &&
                        m.CustomAttributes.Any(
                            ca => ca.AttributeType.FullName == "NUnit.Framework.TestAttribute"));
            return methods;
        }
    }
}