// 邮件发送功能测试脚本
const fetch = require('node-fetch');

async function testEmailSendAPI() {
    try {
        console.log('测试邮件发送功能...');
        
        // 测试邮件发送API
        const response = await fetch('http://localhost:3000/api/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'test@example.com',
                subject: '测试邮件发送功能',
                body: '这是一封测试邮件，用于验证邮件发送功能是否正常工作。'
            })
        });

        const result = await response.json();
        console.log('邮件发送API响应状态:', response.status);
        console.log('邮件发送API响应结果:', JSON.stringify(result, null, 2));
        
        if (response.ok) {
            console.log('✅ 邮件发送API测试成功');
        } else {
            console.log('❌ 邮件发送API测试失败:', result.message || result.error);
            
            // 检查环境变量配置
            console.log('\n检查环境变量配置:');
            console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '未设置');
            console.log('EMAIL_USERNAME:', process.env.EMAIL_USERNAME || '未设置');
            console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '已设置' : '未设置');
        }
    } catch (error) {
        console.log('❌ 邮件发送API测试出错:', error.message);
    }
}

// 运行测试
testEmailSendAPI().catch(console.error);