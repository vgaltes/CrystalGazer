using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FakeItEasyTest
{
    using FakeItEasy;
    using FakeItEasy.ExtensionSyntax.Full;
    using NUnit.Framework;

    [TestFixture]
    public class Class1
    {
        [TestCase]
        public void Test1()
        {
            var testService = A.Fake<ITestService>();
            var anInstance = new ClassThatUsesTheService(testService);

            anInstance.DoThings();

            testService.CallsTo(ts => ts.DoSomethingAndReturnText(A<int>.That.Matches(i => i < 2), A<string>.Ignored)).MustHaveHappened(Repeated.Exactly.Once);
        }
    }

    public class ClassThatUsesTheService
    {
        private readonly ITestService _testService;
        public ClassThatUsesTheService(ITestService testService)
        {
            this._testService = testService;
        }

        public void DoThings()
        {

            _testService.DoSomethingAndReturnText(1, "hello");
        }
    }

    public interface ITestService
    {
        string DoSomethingAndReturnText(int param1, string param2);
    }
}
