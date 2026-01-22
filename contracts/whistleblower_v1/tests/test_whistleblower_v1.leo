// The 'test_whistleblower_v1' test program.
import whistleblower_v1.aleo;
program test_whistleblower_v1.aleo {
    @test
    script test_it() {
        let result: u32 = whistleblower_v1.aleo/main(1u32, 2u32);
        assert_eq(result, 3u32);
    }

    @test
    @should_fail
    transition do_nothing() {
        let result: u32 = whistleblower_v1.aleo/main(2u32, 3u32);
        assert_eq(result, 3u32);
    }

    @noupgrade
    async constructor() {}
}
