using System;
using System.Numerics;
using UnityEngine;
using Vector3 = UnityEngine.Vector3;

namespace AchievementLoader.Rendering;

public class WireFrameCube : MonoBehaviour
{
    public LineRenderer lineRenderer;
    
    private void Start()
    {
        lineRenderer = gameObject.GetOrAddComponent<LineRenderer>();
        lineRenderer.positionCount = 12; // A cube has 12 edges
        lineRenderer.startColor = Color.red;
        lineRenderer.endColor = Color.red;
    }


    private void Update()
    {
        DrawCube(1f);
        lineRenderer.enabled = true;
    }

    private void DrawCube(float boxSize)
    {
        // Calculate the corners of the box
        var frontTopLeft = transform.position + new Vector3(-boxSize / 2, boxSize / 2, boxSize / 2);
        var frontTopRight = transform.position + new Vector3(boxSize / 2, boxSize / 2, boxSize / 2);
        var frontBottomLeft = transform.position + new Vector3(-boxSize / 2, -boxSize / 2, boxSize / 2);
        var frontBottomRight = transform.position + new Vector3(boxSize / 2, -boxSize / 2, boxSize / 2);

        var backTopLeft = transform.position + new Vector3(-boxSize / 2, boxSize / 2, -boxSize / 2);
        var backTopRight = transform.position + new Vector3(boxSize / 2, boxSize / 2, -boxSize / 2);
        var backBottomLeft = transform.position + new Vector3(-boxSize / 2, -boxSize / 2, -boxSize / 2);
        var backBottomRight = transform.position + new Vector3(boxSize / 2, -boxSize / 2, -boxSize / 2);
        
        // Set the positions of the line renderer
        var index = 0;
        // Front face
        lineRenderer.SetPosition(index++, frontTopLeft);
        lineRenderer.SetPosition(index++, frontTopRight);
        lineRenderer.SetPosition(index++, frontBottomRight);
        lineRenderer.SetPosition(index++, frontBottomLeft);
        lineRenderer.SetPosition(index++, frontTopLeft); // Close the loop

        // Back face
        lineRenderer.SetPosition(index++, backTopLeft);
        lineRenderer.SetPosition(index++, backTopRight);
        lineRenderer.SetPosition(index++, backBottomRight);
        lineRenderer.SetPosition(index++, backBottomLeft);
        lineRenderer.SetPosition(index++, backTopLeft); // Close the loop

        // Connections
        lineRenderer.SetPosition(index++, frontTopLeft);
        lineRenderer.SetPosition(index++, backTopLeft);
        lineRenderer.SetPosition(index++, frontTopRight);
        lineRenderer.SetPosition(index++, backTopRight);
        lineRenderer.SetPosition(index++, frontBottomLeft);
        lineRenderer.SetPosition(index++, backBottomLeft);
        lineRenderer.SetPosition(index++, frontBottomRight);
        lineRenderer.SetPosition(index++, backBottomRight);
    }
}