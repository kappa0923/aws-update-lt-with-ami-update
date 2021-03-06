const aws = require('aws-sdk');
const ec2 = new aws.EC2();
const launchTemplateId = process.env.LAUNCH_TEMPLATE_ID;

exports.handler = async (event, context) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the created AMI ID
    const imageId = event.detail.responseElements.imageId;

    // Create a new launch template version with the new AMI ID
    let response = await ec2.createLaunchTemplateVersion({
        LaunchTemplateId: launchTemplateId,
        SourceVersion: '$Latest',
        LaunchTemplateData: {
            ImageId: imageId,
        },
    }).promise();

    // Get the last launch template version
    const latestVersion = response.LaunchTemplateVersion.VersionNumber

    // Update the launch template to use the new version
    response = await ec2.modifyLaunchTemplate({
        LaunchTemplateId: launchTemplateId,
        DefaultVersion: latestVersion.toString(),
    }).promise();

    if (latestVersion > 1) {
        // Delete the previous launch template version
        response = await ec2.deleteLaunchTemplateVersions({
            LaunchTemplateId: launchTemplateId,
            Versions: [[latestVersion - 1].toString()],
        }).promise();
    }

    return response
};
